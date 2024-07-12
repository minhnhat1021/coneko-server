class SiteController {

    // [Get] / site
    home(req, res) {
        res.send('home')
    }
    about(req, res) {
        res.send('about')
    }
    contact(req, res) {
        res.send('contact')
    }
}

module.exports = new SiteController