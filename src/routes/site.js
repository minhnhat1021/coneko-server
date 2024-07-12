const express = require('express')
const router = express.Router()

const siteController = require('../app/controllers/SiteController')


// site controller
router.use('/contact', siteController.contact)
router.use('/about', siteController.about)
router.use('/', siteController.home)


module.exports = router