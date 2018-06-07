const path = require('path');
const marked = require("marked");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');

/*Initialize projects to be bundle*/
const projects = require('./md-to-html.config.json');

/*Function used to create sidebar content for each project*/
const makeMenuBar = (dir, niv, sourceDir) => {
    if (niv==0) {sourceDir = dir}
    niv++
    return fs.readdirSync(dir).reduce((res, file) => {
        const name = path.join(dir, file);
        return fs.statSync(name).isDirectory() ? 
                        fs.existsSync(path.join(name, 'index.md')) ? 
                            res + '<li><a href=\'./' + path.dirname(name).replace(sourceDir, '').replace(/\\/g, '-') + '-' + file + '-index.html' + '\'>' + '&nbsp;'.repeat(niv*4-4) + file + '</a><ul>'  + makeMenuBar(name, niv, sourceDir) + '</ul></li>'  :
                            res + '<li><a href=\'#\'>' + '&nbsp;'.repeat(niv*4-4) + file + '</a><ul>'  + makeMenuBar(name, niv, sourceDir) + '</ul></li>' :
                        (file == 'index.md') ?
                                res 
                                : res + '<li><a href=\'./' + path.dirname(name).replace(sourceDir, '').replace(/\\/g, '-') + '-' + path.basename(name).replace('.md','.html')  + '\'>' + '&nbsp;'.repeat(niv*4-4) +  file.replace('.md', '') + '</a></li>';
                    }, '')
    };     
    

/* function to get MD files to be proceced*/
const getAllFiles = dir =>
  fs.readdirSync(dir).reduce((files, file) => {
    const name = path.join(dir, file);
    const isDirectory = fs.statSync(name).isDirectory();
    return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
  }, []).filter(filename => /\.md$/.test(filename))
 

/*Function to get config*/  
const makeConfig = (project) => (
 {
    entry: project.entry,
    mode: project.mode,
    output: {
        path: project.distDir,
        filename: '[hash].js'
    },
    module: {
        rules: [
          { test:/\.css$/, use:['style-loader','css-loader'] },
          {
            test: /\.(png|jp(e*)g|svg)$/,  
            use: [{
                loader: 'url-loader',
                options: { 
                    limit: 8000, // Convert images < 8kb to base64 strings
                    name: 'images/[hash]-[name].[ext]'
                } 
            }]
        }
        ]},
    
    plugins: getAllFiles(project.sourceDir).map(
         (filename) => (new HtmlWebpackPlugin(
            {
            template: project.templateHTML,
            filename: `${path.dirname(filename).replace(project.sourceDir, '').replace(/\\/g, '-') + '-' + path.basename(filename).replace('.md','.html')}`,
            chunks: [ 'main' ],    
            bodyHTML: marked(fs.readFileSync(filename,'utf-8')),
            menuBarHTML: makeMenuBar(project.sourceDir, 0)
            }))
        )
    });

/*emtpy dest folders*/
const deleteAllfiles = dir => {
    fs.readdirSync(dir).map((file) => {        
        const name = path.join(dir, file);
        const isDirectory = fs.statSync(name).isDirectory();

        if (isDirectory) {
            deleteAllfiles(name);
            fs.rmdirSync(name);
        } else 
        {
            fs.unlinkSync(name);
        }
    });
};

projects.map((project) => {
    deleteAllfiles(project.distDir);
});

module.exports = projects.map(makeConfig);