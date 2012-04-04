function Profile(seed) {
    var self = this;
    var data = util.extend({
        _kind: 'com.nelsun.networkdrives:1',
        name: "",
        address: "",
        mountpoint: "",
        username: "",
        password: "",
        domain: ""
    },
    seed);

    self.serialize = function() {
        return data;
    };

    self.isNew = function() {
        return !!!data._id;
    };

    self.updateRev = function(rev) {
        data._rev = rev;
    };

    self.clear = function() {
        delete data._id;
        delete data._rev;
    };

    self.__defineGetter__('id', function() {
        return data._id;
    });

    self.__defineSetter__('id', function(id) {
        data._id = id;
    });

    self.__defineGetter__('rev', function() {
        return data._rev;
    });

    self.__defineGetter__('name', function() {
        return data.name;
    });
    self.__defineSetter__('name', function(text) {
        data.name = sanitizeInputText(text);
    });

    self.__defineGetter__('displayText', function() {
        return data.name
    });

    self.__defineGetter__('address', function() {
        return data.address;
    });
    self.__defineSetter__('address', function(address) {
        data.address = address;
    });

    self.__defineGetter__('mountpoint', function() {
        return data.mountpoint;
    });
    self.__defineSetter__('mountpoint', function(mountpoint) {
        data.mountpoint = mountpoint;
    });

    self.__defineGetter__('username', function() {
        return data.username;
    });
    self.__defineSetter__('username', function(username) {
        data.username = username;
    });

    self.__defineGetter__('password', function() {
        return data.password;
    });
    self.__defineSetter__('password', function(password) {
        data.password = password;
    });

    self.__defineGetter__('domain', function() {
        return data.domain;
    });
    self.__defineSetter__('domain', function(domain) {
        data.domain = domain;
    });
    self.__defineGetter__('rsize', function() {
        return data.rsize;
    });
    self.__defineSetter__('rsize', function(rsize) {
        data.rsize = rsize;
    });
    self.__defineGetter__('wsize', function() {
        return data.wsize;
    });
    self.__defineSetter__('wsize', function(wsize) {
        data.wsize = wsize;
    });
    self.__defineGetter__('readmode', function() {
        return data.readmode;
    });
    self.__defineSetter__('readmode', function(readmode) {
        data.readmode = readmode;
    });

    return self;

    function sanitizeInputText(str) {
        return str.replace(/<\/?(a)[^>]*>/ig, '').replace(/<div>/ig, "\n").replace(/<\/div>/ig, '').replace(/<br\s*\/?>/ig, "\n").replace(/&nbsp;/ig, ' ');
    }

}