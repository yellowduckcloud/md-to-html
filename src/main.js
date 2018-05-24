import './layout.css';
import './nav.css';
import './content.css';

window.YD_ShowSidebar = () => {
    document.getElementById("nav-wrapper").classList.toggle("nav-wrapper-open");
}

window.YD_Loaded = () => {
    document.body.classList.toggle("FOUC");
}


