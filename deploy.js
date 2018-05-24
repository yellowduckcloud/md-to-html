var FtpDeploy = require('ftp-deploy');
var ftpDeploy = new FtpDeploy();
 
var config = {
    user: "buosigm",  // NOTE that this was username in 1.x 
    password: "15fF254d#", // optional, prompted if none given
    host: "50.62.160.228",
    port: 21,
    localRoot: __dirname + '/dist',
    remoteRoot: '/httpdocs/yd/',
    // include: ['*', '**/*'],  // this would upload everything except dot files
    include: ['*.html', '*.js', '*.css', '**/*'],
    exclude: ['dist/**/*.map']   // e.g. exclude sourcemaps
}
 
// use with promises
ftpDeploy.deploy(config)
    .then(res => console.log('finished'))
    .catch(err => console.log(err))
    
// use with callback
ftpDeploy.deploy(config, function(err) {
    if (err) console.log(err)
    else console.log('finished');
});
ftpDeploy.on('upload-error', function (data) {
    console.log(data.err); // data will also include filename, relativePath, and other goodies
});