export default class Time {
    constructor({
        hours,
        returnVisits = 0,
        placements = 0,
        videos = 0,
        bibleStudies = 0,
    }) {
        this.hours = hours
        this.returnVisits = returnVisits
        this.placements = placements
        this.videos = videos
        this.bibleStudies = bibleStudies
    }

    get json() {
        return JSON.stringify({
            hours: this.hours,
            returnVisits: this.returnVisits,
            placements: this.placements,
            videos: this.videos,
            bibleStudies: this.bibleStudies,
        })
    }
}
