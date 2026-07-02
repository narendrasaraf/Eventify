'use strict';

const express = require('express');
const router = express.Router();
const CommunityController = require('./community.controller');
const { protect, optionalAuth, isAdmin, isBlocked } = require('../../middleware/auth.middleware');
const {
  clubRules,
  postRules,
  commentRules,
  resourceRules,
  announcementRules
} = require('./community.validation');

// ─── Public/Optional Auth Routes ─────────────────────────────────────────────
router.get('/clubs', optionalAuth, isBlocked, CommunityController.getAllClubs);
router.get('/clubs/:id', optionalAuth, isBlocked, CommunityController.getClubById);
router.get('/clubs/:clubId/posts', optionalAuth, isBlocked, CommunityController.getClubPosts);
router.get('/posts/:postId/comments', optionalAuth, isBlocked, CommunityController.getPostComments);
router.get('/clubs/:clubId/resources', optionalAuth, isBlocked, CommunityController.getClubResources);
router.get('/clubs/:clubId/events', optionalAuth, isBlocked, CommunityController.getClubEvents);
router.get('/clubs/:clubId/members', optionalAuth, isBlocked, CommunityController.getClubMembers);
router.get('/clubs/:clubId/leaderboard', optionalAuth, isBlocked, CommunityController.getClubLeaderboard);
router.get('/discussions', optionalAuth, isBlocked, CommunityController.getGlobalPosts);
router.get('/resources', optionalAuth, isBlocked, CommunityController.getGlobalResources);

// ─── Authenticated User Routes (Require login & not blocked) ──────────────────
router.post('/clubs/:id/join', protect, isBlocked, CommunityController.joinClub);
router.post('/clubs/:id/leave', protect, isBlocked, CommunityController.leaveClub);
router.post('/clubs/:clubId/posts', protect, isBlocked, postRules, CommunityController.createPost);
router.post('/posts/:id/like', protect, isBlocked, CommunityController.likePost);
router.delete('/posts/:id', protect, isBlocked, CommunityController.deletePost);

router.post('/posts/:postId/comments', protect, isBlocked, commentRules, CommunityController.createComment);
router.delete('/comments/:id', protect, isBlocked, CommunityController.deleteComment);

router.post('/clubs/:clubId/resources', protect, isBlocked, resourceRules, CommunityController.createResource);
router.delete('/resources/:id', protect, isBlocked, CommunityController.deleteResource);

router.get('/clubs/:clubId/chat/history', protect, isBlocked, CommunityController.getChatHistory);

// ─── Platform Admin Only Routes ──────────────────────────────────────────────
router.post('/clubs', protect, isBlocked, isAdmin, clubRules, CommunityController.createClub);
router.put('/clubs/:id', protect, isBlocked, isAdmin, clubRules, CommunityController.updateClub);
router.delete('/clubs/:id', protect, isBlocked, isAdmin, CommunityController.deleteClub);

router.post('/posts/:id/pin', protect, isBlocked, isAdmin, CommunityController.pinPost);
router.post('/posts/:id/lock', protect, isBlocked, isAdmin, CommunityController.lockPost);

router.get('/admin/users', protect, isBlocked, isAdmin, CommunityController.getAllUsers);
router.post('/admin/users/:id/block', protect, isBlocked, isAdmin, CommunityController.blockUser);
router.post('/admin/users/:id/unblock', protect, isBlocked, isAdmin, CommunityController.unblockUser);
router.delete('/admin/users/:id', protect, isBlocked, isAdmin, CommunityController.deleteUser);

router.get('/admin/analytics', protect, isBlocked, isAdmin, CommunityController.getAnalytics);
router.post('/admin/announcements', protect, isBlocked, isAdmin, announcementRules, CommunityController.createAnnouncement);

module.exports = router;
