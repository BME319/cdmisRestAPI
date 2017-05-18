var config = require('../config'),
    socketioCtrl = require('../controllers/socketio_controller');


module.exports = function (io, webEntry) {
    // Initializes and retrieves the given Namespace

    // var ioDefault = io.of('/' + webEntry.domainName + '/' + (webEntry.routesSocketIO || 'default')); 
    
    // namespace chat
    var ioChat = io.of('/' + 'chat'); 
    ioChat.on('connection', function (socket) {
        socketioCtrl.chat(ioChat, socket); 
    });

    // namespace counsel
    var ioCounsel = io.of('/' + 'counsel'); 
    ioCounsel.on('connection', function (socket) {
        socketioCtrl.counsel(ioCounsel, socket); 
    });
};