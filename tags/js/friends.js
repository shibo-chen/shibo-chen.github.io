
var sites = [
    'https://sannndy0000.github.io/',
    'https://niceirene.github.io/',
    'https://shengpu1126.github.io/',
    'https://yifanguan.github.io/',
    'https://xingjunjie.me/blog/',
    'https://pyjhzwh.github.io/',
    'http://www-personal.umich.edu/~yhhy/',
    'https://xintongemilywang.github.io/',
    'https://jiaxin-pei.github.io/',
    'https://were.github.io/'
];
function randomSite() {
    var i = parseInt(Math.random() * sites.length);
    window.location.href = sites[i];
}