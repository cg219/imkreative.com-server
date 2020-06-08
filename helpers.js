const formatDate = function(pubDate) {
    const now = Date.now();
    const msInADay = 1000 * 60 * 60 * 24;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let date = new Date(pubDate);
    let parsed = date.getMilliseconds();
    let time = Math.abs(now - date);
    let days = Math.floor(time / msInADay);

    if ( days > 6 ) {
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } else if (days > 0 && days <= 6) {
        let plural = days === 1 ? '' : 's';
        return `${days} day${plural} ago`;
    } else if (days <= 0) {
        return 'Today';
    }
}

const seasonizeDate = function(date) {
    let localDate = new Date(date);
    let season;
    let year;

    switch (localDate.getMonth()) {
        case 0:
        case 1:
        case 2:
            season = 'Winter';
            break;
        case 3:
        case 4:
        case 5:
            season = 'Spring';
            break;
        case 6:
        case 7:
        case 8:
            season = 'Summer';
            break;
        case 9:
        case 10:
        case 11:
            season = 'Fall';
            break;
        default:
            season = 'Spring';
            break;
    }

    return `${season} ${localDate.getFullYear()}`;
}

const checkTag = function(term, tags) {
    return tags.some(tag => tag.name.toLowerCase().indexOf(term.toLowerCase()) >= 0);
}

const appendFormattedDates = async function(posts) {
    return await posts.map(post => {
        let updatedPost = { ...post };

        updatedPost.formatted_date = formatDate(updatedPost.published_at);
        return updatedPost;
    })
}

module.exports = { formatDate, seasonizeDate, checkTag, appendFormattedDates }
