const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification'); // Import Notification model

// Apply to a job
router.post('/:jobId/apply', auth, async (req, res) => {
    try {
        if (req.user.role !== 'agent') {
            return res.status(403).json({ msg: 'Only agents can apply to jobs' });
        }

        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ msg: 'Job not found' });

        // Check if already applied
        const existing = await Application.findOne({ job: req.params.jobId, agent: req.user.id });
        if (existing) return res.status(400).json({ msg: 'Already applied to this job' });

        const application = new Application({
            job: req.params.jobId,
            agent: req.user.id,
            coverLetter: req.body.coverLetter
        });

        await application.save();

        // Notify Employer (only if employer is not the applicant)
        if (job.employer.toString() !== req.user.id) {
            const notification = new Notification({
                user: job.employer,
                message: `New application received for ${job.title}`,
                type: 'application_received',
                relatedLink: `/job/${job._id}/applicants`
            });
            await notification.save();

            // Emit socket event
            req.io.to(job.employer.toString()).emit('notification', notification);
        }

        res.json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get My Applications (Agent)
router.get('/my', auth, async (req, res) => {
    try {
        const applications = await Application.find({ agent: req.user.id })
            .populate('job')
            .sort({ appliedAt: -1 });
        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Applicants for a Job (Employer)
router.get('/job/:jobId', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (job.employer.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const applications = await Application.find({ job: req.params.jobId })
            .populate('agent', 'name email')
            .populate({
                path: 'agent',
                select: 'name email',
            });

        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Status (Employer)
router.post('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body; // 'reviewing', 'selected', 'rejected', 'hired'
        const application = await Application.findById(req.params.id).populate('job');

        if (!application) return res.status(404).json({ msg: 'Application not found' });

        if (application.job.employer.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        application.status = status;
        await application.save();

        // Notify Agent of status change (Only for Hired or Rejected)
        // Notify Agent of status change (Only for Hired or Rejected)
        console.log(`[Status Update] ID: ${req.params.id}, New Status: ${status}`);

        if (status === 'hired' || status === 'rejected') {
            let message = '';
            if (status === 'hired') {
                message = `Congratulations! You have been hired for ${application.job.title}`;
            } else if (status === 'rejected') {
                message = `Your application for ${application.job.title} was rejected`;
            }

            console.log(`[Notification] Preparing to send '${status}' notification to Agent: ${application.agent}`);

            const notification = new Notification({
                user: application.agent,
                message: message,
                type: 'status_change',
                relatedLink: `/dashboard`,
                read: false
            });
            await notification.save();

            console.log(`[Socket] Emitting to room: ${application.agent.toString()}`);
            req.io.to(application.agent.toString()).emit('notification', notification);
        } else {
            console.log(`[Notification] Skipped. Status '${status}' is not hired/rejected.`);
        }

        res.json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
