module.exports = { 
    mysql_info : {
        host            : 'localhost',
        user            : 'root',
        password        : '',
        database        : '',
        connectionLimit : 10,
    },
    admin_info : {
        id       : 'admin',
        password : '12345'
    },
    accepting_entries : true,
    session_secret    : 'anysecretshallbeprotectedthroughencryptionbuteveryrulehasexceptionslikethisone',
    lang : {
        song_not_found        : 'Sorry we couldn\'t find your song in our database, please try again',
        submission_accepted   : 'Thank you for your submission! Prepare your voice and be ready to sing!',
        not_accepting_entries : 'It\'s still too early to sing! Keep practicing and suprise us!'
    }
}