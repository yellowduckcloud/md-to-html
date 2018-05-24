const path = require('path');
const marked = require("marked");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');

const MD_SOURCE_DIR = 'md\\es\\';

const getAllFiles = dir =>
  fs.readdirSync(dir).reduce((files, file) => {
    const name = path.join(dir, file);
    const isDirectory = fs.statSync(name).isDirectory();
    return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
  }, []);


const markdownFilesData = getAllFiles(MD_SOURCE_DIR)
    .filter(filename => /\.md$/.test(filename))
    .map(filename => {
        return {
            markdown: fs.readFileSync(
              filename,'utf-8'
            ),
            filename: path.dirname(filename).replace(MD_SOURCE_DIR, '').replace('\\', '-') + '-' + path.basename(filename).replace('.md','.html')
        }
    });

const makeHtmlConfig = ({markdown, filename }) => (new HtmlWebpackPlugin(
        {
        template: './src/template.html',
        filename: `${filename}`,
        chunks: [ 'main' ],    
        bodyHTML: marked(markdown),
        menuBarHTML: menuBar
        })
    );   

const makeMenuBar = (dir, niv) => {
    niv++
    return fs.readdirSync(dir).reduce((res, file) => {
        const name = path.join(dir, file);
        return fs.statSync(name).isDirectory() ? 
                        fs.existsSync(path.join(name, 'index.md')) ? 
                            res + '<li><a href=\'./' + path.dirname(name).replace(MD_SOURCE_DIR, '').replace('\\', '-') + '-' + file + '-index.html' + '\'>' + '&nbsp;'.repeat(niv*4-4) + file + '</a><ul>'  + makeMenuBar(name, niv) + '</ul></li>'  :
                            res + '<li><a href=\'#\'>' + '&nbsp;'.repeat(niv*4-4) + file + '</a><ul>'  + makeMenuBar(name, niv) + '</ul></li>' :
                        (file == 'index.md') ?
                                res 
                                : res + '<li><a href=\'./' + path.dirname(name).replace(MD_SOURCE_DIR, '').replace('\\', '-') + '-' + path.basename(name).replace('.md','.html')  + '\'>' + '&nbsp;'.repeat(niv*4-4) +  file.replace('.md', '') + '</a></li>';
                    }, '')
    };    
        
const menuBar = makeMenuBar(MD_SOURCE_DIR, 0);


module.exports = {
    entry: './src/main.js',
    mode: "production",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js', 
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
        ]
      },
    plugins: markdownFilesData.map(makeHtmlConfig)
    };  