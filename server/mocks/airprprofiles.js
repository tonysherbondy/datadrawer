module.exports = function(app) {
  var express = require('express');
  var airprprofilesRouter = express.Router();

  airprprofilesRouter.get('/', function(req, res) {
    res.send({
      'airprprofiles': []
    });
  });

  airprprofilesRouter.post('/', function(req, res) {
    res.status(201).end();
  });

  airprprofilesRouter.get('/:id', function(req, res) {
    res.send({
      "profiles": [{
        "company_name": "Gyft",
        "id": 11,
        "start_date": "2012-08-02",
        "image_url": "https://dev-airpr-roi.s3.amazonaws.com/profiles/profile_images/000/000/011/thumb/mzl.cpgclkeq.png?1366856763",
        "url": "http://gyft.com/",
        "title": null,
        "header_data": true,
        "parent_id": 12,
        "twitter_page": null,
        "facebook_page": "gyft",
        "gplus_page": null,
        "linkedin_page": null,
        "type_cd": 2,
        "onboarding_complete_admin": false
      }, {
        "company_name": "Leap Motion",
        "id": 48,
        "start_date": "2013-01-01",
        "image_url": "https://dev-airpr-roi.s3.amazonaws.com/profiles/profile_images/000/000/048/thumb/leap.png?1373407320",
        "url": "https://www.leapmotion.com/",
        "title": null,
        "header_data": true,
        "parent_id": 12,
        "twitter_page": "LeapMotion",
        "facebook_page": "Leap Motion",
        "gplus_page": null,
        "linkedin_page": null,
        "type_cd": 3,
        "onboarding_complete_admin": false
      }, {
        "company_name": "me",
        "id": 77,
        "start_date": "2014-03-16",
        "image_url": "/assets/dashboard-placeholder.png",
        "url": null,
        "title": "Chief Executive Officer",
        "header_data": true,
        "parent_id": 12,
        "twitter_page": null,
        "facebook_page": null,
        "gplus_page": null,
        "linkedin_page": null,
        "type_cd": 4,
        "onboarding_complete_admin": false
      }, {
        "company_name": "Raj Sathyamurthi",
        "id": 80,
        "start_date": "2014-03-23",
        "image_url": "/assets/dashboard-placeholder.png",
        "url": null,
        "title": "Chief Executive Officer",
        "header_data": true,
        "parent_id": 12,
        "twitter_page": null,
        "facebook_page": null,
        "gplus_page": null,
        "linkedin_page": null,
        "type_cd": 4,
        "onboarding_complete_admin": false
      }, {
        "company_name": "test123",
        "id": 81,
        "start_date": "2014-03-25",
        "image_url": "/assets/dashboard-placeholder.png",
        "url": null,
        "title": "Chief Operating Officer",
        "header_data": true,
        "parent_id": 12,
        "twitter_page": null,
        "facebook_page": null,
        "gplus_page": null,
        "linkedin_page": null,
        "type_cd": 4,
        "onboarding_complete_admin": false
      }, {
        "company_name": "Test",
        "id": 83,
        "start_date": "2014-04-12",
        "image_url": "/assets/dashboard-placeholder.png",
        "url": null,
        "title": "Chief Executive Officer",
        "header_data": true,
        "parent_id": 12,
        "twitter_page": null,
        "facebook_page": "",
        "gplus_page": null,
        "linkedin_page": null,
        "type_cd": 4,
        "onboarding_complete_admin": false
      }, {
        "company_name": "tee",
        "id": 91,
        "start_date": "2014-09-10",
        "image_url": "/assets/dashboard-placeholder.png",
        "url": null,
        "title": "Chief Executive Officer",
        "header_data": true,
        "parent_id": 12,
        "twitter_page": "",
        "facebook_page": null,
        "gplus_page": null,
        "linkedin_page": null,
        "type_cd": 4,
        "onboarding_complete_admin": false
      }],
      "campaigns": [{
        "id": 1,
        "profile_id": 12,
        "tag_id": null,
        "name": "New Campaign",
        "start_date": "2014-06-17",
        "end_date": null,
        "campaign_keyword_ids": [],
        "campaign_analytics_goal_relationship_ids": [],
        "analytics_goal_ids": [],
        "campaign_analytics_event_relationship_ids": [],
        "analytics_event_ids": []
      }, {
        "id": 2,
        "profile_id": 12,
        "tag_id": null,
        "name": "New Campaign",
        "start_date": "2014-06-20",
        "end_date": null,
        "campaign_keyword_ids": [],
        "campaign_analytics_goal_relationship_ids": [],
        "analytics_goal_ids": [],
        "campaign_analytics_event_relationship_ids": [],
        "analytics_event_ids": []
      }, {
        "id": 3,
        "profile_id": 12,
        "tag_id": null,
        "name": "New Campaign",
        "start_date": "2014-06-21",
        "end_date": "2014-06-17",
        "campaign_keyword_ids": [],
        "campaign_analytics_goal_relationship_ids": [1],
        "analytics_goal_ids": [],
        "campaign_analytics_event_relationship_ids": [],
        "analytics_event_ids": []
      }, {
        "id": 4,
        "profile_id": 12,
        "tag_id": 16,
        "name": "Test campaign",
        "start_date": "2013-11-01",
        "end_date": null,
        "campaign_keyword_ids": [1],
        "campaign_analytics_goal_relationship_ids": [],
        "analytics_goal_ids": [],
        "campaign_analytics_event_relationship_ids": [],
        "analytics_event_ids": []
      }, {
        "id": 5,
        "profile_id": 12,
        "tag_id": null,
        "name": "Another",
        "start_date": "2015-01-20",
        "end_date": null,
        "campaign_keyword_ids": [],
        "campaign_analytics_goal_relationship_ids": [],
        "analytics_goal_ids": [],
        "campaign_analytics_event_relationship_ids": [],
        "analytics_event_ids": []
      }, {
        "id": 6,
        "profile_id": 12,
        "tag_id": null,
        "name": "Other",
        "start_date": "2015-01-20",
        "end_date": "2015-01-26",
        "campaign_keyword_ids": [],
        "campaign_analytics_goal_relationship_ids": [],
        "analytics_goal_ids": [],
        "campaign_analytics_event_relationship_ids": [1],
        "analytics_event_ids": [431]
      }],
      "campaign_keywords": [{
        "id": 1,
        "campaign_id": 4,
        "name": "PR"
      }],
      "campaign_analytics_goal_relationships": [{
        "id": 1,
        "campaign_id": 3,
        "analytics_goal_id": 15,
        "created_at": "2014-06-21T16:21:17.000-07:00"
      }],
      "analytics_goals": [],
      "campaign_analytics_event_relationships": [{
        "id": 1,
        "campaign_id": 6,
        "analytics_event_id": 431,
        "created_at": "2015-01-20T23:34:09.000-08:00"
      }],
      "analytics_events": [{
        "id": 431,
        "analytics_profile_id": 80,
        "name": "Campaign date selected",
        "display_name": "Campaign date selected",
        "value": 200,
        "created_at": "2015-01-14T15:20:51.000-08:00"
      }],
      "competitors": [{
        "company_name": "Squarespace",
        "id": 37,
        "image_url": "/assets/dashboard-placeholder.png",
        "url": "http://www.squarespace.com/",
        "profile_ids": [34, 12, 75],
        "start_date": "2013-03-26",
        "onboarding_complete_admin": false
      }, {
        "company_name": "Mixpanel",
        "id": 33,
        "image_url": "/assets/dashboard-placeholder.png",
        "url": "http://www.mixpanel.com/",
        "profile_ids": [30, 12, 75],
        "start_date": "2013-03-14",
        "onboarding_complete_admin": false
      }, {
        "company_name": "Wrapp",
        "id": 65,
        "image_url": "/assets/dashboard-placeholder.png",
        "url": "https://www.wrapp.com/",
        "profile_ids": [11, 12],
        "start_date": "2013-04-15",
        "onboarding_complete_admin": false
      }, {
        "company_name": "AirPR",
        "id": 12,
        "image_url": "/assets/dashboard-placeholder.png",
        "url": "http://www.airpr.com/",
        "profile_ids": [12, 12],
        "start_date": "2012-08-25",
        "onboarding_complete_admin": true
      }, {
        "company_name": "Urban Airship",
        "id": 31,
        "image_url": "/assets/dashboard-placeholder.png",
        "url": "http://urbanairship.com/",
        "profile_ids": [12],
        "start_date": "2013-03-14",
        "onboarding_complete_admin": false
      }, {
        "company_name": "AirPR",
        "id": 75,
        "image_url": "/assets/dashboard-placeholder.png",
        "url": "http://www.airpr.com/",
        "profile_ids": [12],
        "start_date": "2012-08-25",
        "onboarding_complete_admin": false
      }, {
        "company_name": "",
        "id": 85,
        "image_url": "/assets/dashboard-placeholder.png",
        "url": null,
        "profile_ids": [12],
        "start_date": "2014-04-12",
        "onboarding_complete_admin": false
      }, {
        "company_name": "O'Dwyer's",
        "id": 39,
        "image_url": "/assets/dashboard-placeholder.png",
        "url": "http://www.odwyerpr.com/",
        "profile_ids": [12],
        "start_date": "2013-04-02",
        "onboarding_complete_admin": false
      }, {
        "company_name": "   PRSA JobCenter",
        "id": 38,
        "image_url": "/assets/dashboard-placeholder.png",
        "url": "http://www.prsa.org/",
        "profile_ids": [12],
        "start_date": "2013-04-02",
        "onboarding_complete_admin": false
      }],
      "tags": [{
        "id": 18,
        "name": "Testing123",
        "visibility": 1,
        "user_name": "Bob Smith",
        "user_id": 12,
        "profile_id": 12,
        "updated_at": "2014-10-03T18:35:34.000-07:00"
      }, {
        "id": 17,
        "name": "Testing",
        "visibility": 0,
        "user_name": "Bob Smith",
        "user_id": 12,
        "profile_id": 12,
        "updated_at": "2014-10-03T18:34:01.000-07:00"
      }, {
        "id": 29,
        "name": "siete",
        "visibility": 1,
        "user_name": "Bob Smith",
        "user_id": 12,
        "profile_id": 12,
        "updated_at": "2015-01-20T21:42:50.000-08:00"
      }, {
        "id": 30,
        "name": "ocho",
        "visibility": 0,
        "user_name": "Bob Smith",
        "user_id": 12,
        "profile_id": 12,
        "updated_at": "2015-01-20T21:55:16.000-08:00"
      }, {
        "id": 20,
        "name": "mytag",
        "visibility": 0,
        "user_name": "Bob Smith",
        "user_id": 12,
        "profile_id": 12,
        "updated_at": "2015-01-20T16:30:04.000-08:00"
      }, {
        "id": 28,
        "name": "seis",
        "visibility": 0,
        "user_name": "Bob Smith",
        "user_id": 12,
        "profile_id": 12,
        "updated_at": "2015-01-20T21:42:09.000-08:00"
      }, {
        "id": 27,
        "name": "cinco",
        "visibility": 0,
        "user_name": "Bob Smith",
        "user_id": 12,
        "profile_id": 12,
        "updated_at": "2015-01-20T21:30:51.000-08:00"
      }, {
        "id": 21,
        "name": "tonytag",
        "visibility": 0,
        "user_name": "Bob Smith",
        "user_id": 12,
        "profile_id": 12,
        "updated_at": "2015-01-20T17:05:15.000-08:00"
      }, {
        "id": 22,
        "name": "another",
        "visibility": 0,
        "user_name": "Bob Smith",
        "user_id": 12,
        "profile_id": 12,
        "updated_at": "2015-01-20T17:11:07.000-08:00"
      }, {
        "id": 23,
        "name": "dos",
        "visibility": 0,
        "user_name": "Bob Smith",
        "user_id": 12,
        "profile_id": 12,
        "updated_at": "2015-01-20T17:22:13.000-08:00"
      }, {
        "id": 24,
        "name": "tres",
        "visibility": 0,
        "user_name": "Bob Smith",
        "user_id": 12,
        "profile_id": 12,
        "updated_at": "2015-01-20T17:25:10.000-08:00"
      }, {
        "id": 25,
        "name": "uno",
        "visibility": 0,
        "user_name": "Bob Smith",
        "user_id": 12,
        "profile_id": 12,
        "updated_at": "2015-01-20T21:27:32.000-08:00"
      }, {
        "id": 26,
        "name": "quatro",
        "visibility": 0,
        "user_name": "Bob Smith",
        "user_id": 12,
        "profile_id": 12,
        "updated_at": "2015-01-20T21:29:14.000-08:00"
      }, {
        "id": 19,
        "name": "tagiest",
        "visibility": 0,
        "user_name": "Bob Smith",
        "user_id": 12,
        "profile_id": 12,
        "updated_at": "2014-11-11T13:09:27.000-08:00"
      }],
      "owned_media": [{
        "url": "raj.airpr.com",
        "id": 3,
        "type_cd": 0,
        "profile_id": 12
      }],
      "profile": {
        "company_name": "AirPR",
        "id": 12,
        "locations": [],
        "sorts": [{
          "values": ["Coverage", "Visitors", "AirPR Score", "Revenue"],
          "group": "General"
        }, {
          "values": ["Twitter", "Facebook", "Google Plus", "LinkedIn"],
          "group": "Amplification"
        }],
        "default_filters": {},
        "start_date": "2012-08-25",
        "image_url": "/assets/dashboard-placeholder.png",
        "url": "http://www.airpr.com/",
        "facebook_page": null,
        "twitter_page": null,
        "salesforce_email": null,
        "owned_media": [{
          "id": 3,
          "profile_id": 12,
          "url": "raj.airpr.com",
          "type_cd": 0
        }],
        "linkedin_page": null,
        "gplus_page": null,
        "temp_analytics_provider": "google",
        "analytics_profile_id": 80,
        "onboarding_complete_admin": true,
        "sector": "Analytics",
        "title": null,
        "crm_provider": "",
        "header_data": false,
        "onboarding_current_step": 8,
        "type_cd": 0,
        "features": [],
        "brand_ids": [11],
        "product_ids": [48],
        "campaign_ids": [1, 2, 3, 4, 5, 6],
        "competitor_ids": [37, 33, 65, 12, 12, 31, 75, 85, 39, 38],
        "executive_ids": [77, 80, 81, 83, 91],
        "parent_id": null,
        "tag_ids": [18, 17, 29, 30, 20, 28, 27, 21, 22, 23, 24, 25, 26, 19],
        "owned_medium_ids": [3]
      }
    });
  });

  airprprofilesRouter.put('/:id', function(req, res) {
    res.send({
      'airprprofiles': {
        id: req.params.id
      }
    });
  });

  airprprofilesRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/airprprofiles', airprprofilesRouter);
};
