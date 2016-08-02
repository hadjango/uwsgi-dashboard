import $ from 'jquery';

window.$ = window.jQuery = $;

import ko from 'knockout';
import 'knockout-mapping';
import filesize from 'filesize';
import 'moment-duration-format';
import moment from 'moment';
import "./knockout-bootstrap-popover";

var modelRegistry;

var deployColorIndexes = {};
var deployCount = 0;
var viewModel;

function getDeployIndex(deploy) {
    if (!(deploy in deployColorIndexes)) {
        deployColorIndexes[deploy] = deployCount % 10;
        deployCount++;
        viewModel.deploys.push(new Deploy({tag: deploy}));
    }
    return deployColorIndexes[deploy];
}

class Worker {
    constructor(data, parent) {
        data = $.extend({
            requests: 0,
            delta_requests: 0,
            running_time: 0,
            exceptions: 0,
            avg_rt: 0
        }, data);
        ko.mapping.fromJS(data, {}, this);
        this.master = parent;
    }
    deployIndex() {
        return getDeployIndex(this.deploy_tag());
    }
    className() {
        var classNames = [
            'deploy-' + this.deployIndex(),
            this.status()
        ];
        if (this.status() != 'sleeping' && this.delta_requests() === 0) {
            classNames.push("no-requests");
        }
        return classNames.join(" ");
    }
    tooltipTitle() {
        return `worker ${this.worker_num()} [${this.pid()}]`;
    }
    createTime() {
        return moment.unix(this.create_time()).calendar();
    }
    rssSize() {
        return filesize(this.rss());
    }
    vszSize() {
        return filesize(this.vsz());
    }
    averageResponseTime() {
        return Math.round(this.avg_rt() / 1000) + ' ms';
    }
    runningTime() {
        return moment.duration(this.running_time() / 1000, "ms").format("d[d] h[h] mm[m] ss[s]");
    }
    currentRequestUrl() {
        try {
            return this.cores()[0].vars()[1].replace(/^[^=]+=/, '');
        } catch(e) {
            return '';
        }
    }
}

class Process {
    constructor(data, parent) {
        ko.mapping.fromJS(data, {
            workers: {
                create: function(options) {
                    return new Worker(options.data, options.parent);
                },
                key: function(worker) { return ko.unwrap(worker.pid); }
            }
        }, this);
        this.config = parent;
        // this.server = this.config.server;
    }
    queue() {
        try {
            return this.sockets()[0].queue();
        } catch(e) {
            return 0;
        }
    }
    queueClass() {
        return (this.queue() > 0) ? 'has-queue' : '';
    }
    queuePercentage() {
        return 100 * this.queue() / this.maxQueue();
    }
    maxQueue() {
        try {
            return this.sockets()[0].max_queue();
        } catch(e) {
            return 1;
        }
    }
}

class Server {
    constructor(data) {
        ko.mapping.fromJS(data, {
            servers: {
                create: function(options) {
                    return new Server(options.data);
                },
                key: function(server) { return ko.unwrap(server.hostname); }
            }
        }, this);
        this.deployTags = ko.observableArray();
    }
}

class Config {
    constructor(data, parent) {
        ko.mapping.fromJS(data, {
            processes: {
                create: function(options) {
                    return new Process(options.data, options.parent);
                },
                key: function(process) { return ko.unwrap(process.pid); }
            }
        }, this);
        this.server = parent;
    }
}

class Deploy {
    constructor(data) {
        ko.mapping.fromJS(data, {}, this);
    }
    index() {
        return getDeployIndex(this.tag());
    }
}


var timestamp = Math.floor(+(new Date()) / 1000);
$.getJSON('status.json?t=' + timestamp, function(data) {
    // var data = {
    //     'servers': [{
    //         'hostname': 'web',
    //         'configs': d.configs
    //     }],
    //     'configs': d.configs
    // };
    data.deploys = [];
    viewModel = ko.mapping.fromJS(data, {
        configs: {
            create: function(options) {
                return new Config(options.data);
            },
            key: function(config) { return ko.unwrap(config.name); }
        },
        deploys: {
            create: function(options) { return new Deploy(options.data); },
            key: function(deploy) { return ko.unwrap(deploy.tag); }
        }
    });
    ko.applyBindings(viewModel);
});

function updateData() {
    timestamp = Math.floor(+(new Date()) / 1000);
    $.getJSON('status.json?t=' + timestamp, function(data) {
        ko.mapping.fromJS(data, viewModel);
    }).always(function() {
        setTimeout(updateData, 500);
    });
}

setTimeout(updateData, 500);
