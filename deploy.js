var FtpDeploy = require('ftp-deploy');
var ftpDeploy = new FtpDeploy();
 
const projects = require('./md-to-html.config.json'); 

projects.map( (project) => {
    if (project.hasOwnProperty("ftpDeployConfig")) {
        let config = project.ftpDeployConfig;
        config.include = ['*.html', '*.js', '*.css', '**/*'];
        config.exclude = ['dist/**/*.map']; 
        config.localRoot = project.distDir; 
        
        ftpDeploy.deploy(config, function(err) {
            if (err) console.log(err)
            else console.log('finished');
        });
    }
});
