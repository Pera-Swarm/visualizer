import * as THREE from 'three';
import TWEEN, { update } from '@tweenjs/tween.js';
import MQTT from 'paho-mqtt';

import Config from '../../data/config';
import Obstacle from '../components/obstacle';
import Robot from '../components/robot';
import { getCredentials } from '../helpers/urlHelper';

// -----------------------------------------------------------------------------
// MQTT Topics

// Create and delete robot objects
const TOPIC_ROBOT_CREATE = 'robot/create';
const TOPIC_ROBOT_DELETE = 'robot/delete';
const TOPIC_ROBOT_BROADCAST = 'robot/msg/broadcast';

// This will provide location data to the GUI
const TOPIC_LOC_INFO_FROM_SERVER = 'localization/data';
const TOPIC_LOC_INFO_FROM_LOC_SYSTEMS = 'localization/update';

// This will request the localization data update from the server
const TOPIC_LOC_REQUEST = 'localization/data/?';

// This will request obstacle data from the server
const TOPIC_OBSTACLE_REQUEST = 'obstacles/?';

// This will send obstacle data as a JSON list
const TOPIC_OBSTACLES_LIST = 'obstacles';
const TOPIC_OBSTACLES_DELETE = 'obstacles/delete';
const TOPIC_OBSTACLES_DELETE_ALL = 'obstacles/delete/all';

// Robot Color - NeoPixel
const TOPIC_CHANGE_COLOR = 'output/neopixel';

const TOPIC_ARENA_CONFIG = "config/arena/";

// This will help to remote update the parameters in here
const TOPIC_MANAGEMENT_VISUALIZER = 'mgt/visualizer';

// Robot management snapshot topic
const TOPIC_MANAGEMENT_SNAPSHOT = 'mgt/robots/?';

// -----------------------------------------------------------------------------

export default class MQTTClient {
    constructor(scene) {
        this.scene = scene;
        this.robot = new Robot(scene);
        this.obstacles = new Obstacle(scene);

        const credentials = getCredentials();
        this.updateChannel();

        if (credentials === -1) {
            alert('Unauthorized access! The Visualizer will not work properly.');
        } else {
            const { username, password } = credentials;
            // create a random client Id
            const client_id = 'client_' + Math.random().toString(36).substring(2, 15);
            this.client = new MQTT.Client(Config.mqtt.server, Config.mqtt.port, Config.mqtt.path, client_id);

            window.mqtt = this.client;
            window.channel = credentials.channel === undefined ? 'v1' : credentials.channel;

            this.client.connect({
                userName: username,
                password: password,
                reconnect: true,
                useSSL: true,
                cleanSession: false,
                onSuccess: () => {
                    console.log('MQTT: connected');

                    // Subscribe to topics
                    this.subscribe(TOPIC_LOC_INFO_FROM_SERVER);
                    this.subscribe(TOPIC_LOC_INFO_FROM_LOC_SYSTEMS);

                    this.subscribe(TOPIC_ROBOT_CREATE);
                    this.subscribe(TOPIC_ROBOT_DELETE);
                    this.subscribe(TOPIC_ROBOT_BROADCAST);

                    this.subscribe(TOPIC_CHANGE_COLOR);
                    this.subscribe(TOPIC_OBSTACLES_LIST);
                    this.subscribe(TOPIC_OBSTACLES_DELETE);
                    this.subscribe(TOPIC_OBSTACLES_DELETE_ALL);
                    this.subscribe(TOPIC_MANAGEMENT_VISUALIZER);
                    this.subscribe(TOPIC_ARENA_CONFIG);
                    this.subscribe(TOPIC_MANAGEMENT_SNAPSHOT);

                    // Request for obstacle data
                    // this.publish(TOPIC_OBSTACLE_REQUEST, Config.mixedReality.obstacles);
                    this.publish(TOPIC_OBSTACLE_REQUEST, 'M');

                    // Request for coordinate data
                    this.publish(TOPIC_LOC_REQUEST, Config.mixedReality.robots);

                    // Access globally
                    window.robot = this.robot;
                    window.obstacles = this.obstacles;

                    this.client.onMessageArrived = this.onMessageArrived;
                    this.client.onConnectionLost = this.onConnectionLost;
                },
                onFailure: () => {
                    console.log('MQTT: connection failed');
                    alert('MQTT: connection failed!');
                }
            });
        }
    }

    updateChannel() {
        // const channelHash = window.location.hash;
        // if ((channelHash != '') & (channelHash.length > 1)) {
        //     // window.channel = channelHash.substring(1);
        //     window.channel = channelHash.split('#')[1].split('?')[0];
        // } else {
        //     window.channel = Config.mqtt.channel;
        // }
        // console.log('MQTT: channel=', window.channel, channelHash);
        // return true;
    }

    onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log('MQTT: onConnectionLost:' + responseObject.errorMessage);
            console.log('MQTT: reconnecting');
        }
    }

    onMessageArrived(packet) {
        const msg = packet.payloadString.trim();
        const t = packet.destinationName;
        const topic = t.substring(t.indexOf('/') + 1);

        // console.log('MQTT: ' + topic + ' > ' + msg);

        if (topic == TOPIC_ROBOT_CREATE) {
            try {
                const data = JSON.parse(msg);
                window.robot.create(data.id, data.x, data.y, data.heading, data.reality);
            } catch (e) {
                console.error(e);
            }
        } else if (topic == TOPIC_ROBOT_DELETE) {
            try {
                var data = JSON.parse(msg);
                window.robot.delete(data.id);
            } catch (e) {
                console.error(e);
            }
        } else if (topic == TOPIC_LOC_INFO_FROM_LOC_SYSTEMS || topic == TOPIC_LOC_INFO_FROM_SERVER) {
            //Data from the localization server or virtual robots
            try {
                const data = JSON.parse(msg);
                const REALITY = Config.mixedReality.robots;

                // Render only the received data is same as configured reality
                // or configuration allowed mixed reality
                if (data != undefined) {
                    // Have data on this reality
                    for (const i in data) {
                        const { id, x, y, heading } = data[i];
                        const reality = data[i].reality == undefined ? 'V' : data[i].reality;

                        if (reality === REALITY || REALITY === 'M') {
                            // Create only if robots match with platform's allowed reality
                            if (window.robot.exists(id) == undefined) {
                                window.robot.create(id, x, y, heading, reality);
                            } else {
                                window.robot.move(id, x, y, heading);
                                window.robot.setReality(id, reality);
                            }
                        } else {
                            // reality not matching; remove
                            robot.delete(id);
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }
        } else if (topic == TOPIC_OBSTACLES_LIST) {
            // Create obstacles in the arena
            try {
                const data = JSON.parse(msg);
                window.obstacles.createList(data);
            } catch (e) {
                console.error(e);
            }
        } else if (topic == TOPIC_OBSTACLES_DELETE) {
            // Delete obstacle given in the id
            const data = JSON.parse(msg);
            console.log(data);

            window.obstacles.deleteIfExists(data.id);
        } else if (topic == TOPIC_OBSTACLES_DELETE_ALL) {
            // Delete all obstacles
            window.obstacles.deleteAll();
        } else if (topic == TOPIC_CHANGE_COLOR) {
            try {
                const data = JSON.parse(msg);
                window.robot.changeColor(data.id, data.R, data.G, data.B, data.ambient);
            } catch (e) {
                console.error(e);
            }
        } else if (topic == TOPIC_ROBOT_BROADCAST) {
            // Display a popup message
            // TODO: Do this by a generalized function call

            if (msg != 'ID? -1') {
                const m = 'Broadcast Message: ' + msg.split(' ')[0];
                const t = 1000 + msg.length * 95;

                const disp = document.querySelector('#msg-box');
                disp.innerHTML = m;
                disp.style.display = 'block';

                setTimeout(function () {
                    document.querySelector('#msg-box').style.display = 'none';
                }, t);
            }
        } else if (topic == TOPIC_MANAGEMENT_VISUALIZER) {
            if (msg === 'REFRESH') {
                console.log('page refresh request');
                location.reload();
            } else if (msg.startsWith('MSG')) {
                const m = 'Notice: ' + msg.substring(4);
                const t = 2000 + m.length * 95;

                // Display a popup message
                // TODO: Do this by a generalized function call
                const disp = document.querySelector('#msg-box');
                disp.innerHTML = m;
                disp.style.display = 'block';

                setTimeout(function () {
                    document.querySelector('#msg-box').style.display = 'none';
                }, t);
            } else {
                console.log('>Management:', msg);
            }
        } else if (topic == TOPIC_MANAGEMENT_SNAPSHOT) {
            const snapshot = JSON.parse(msg);
            console.log('Robot:Snapshot', snapshot);
            if (snapshot !== -1) {
                let i = 0,
                    subElement;
                const disp = document.querySelector('#msg-box');
                const prevContent = document.getElementById('msg-content');
                const content = document.createElement('div');
                content.setAttribute('id', 'msg-content');
                const titleElement = document.createElement('h3');
                titleElement.textContent = `Robot [${snapshot.id}] Snapshot`;
                content.appendChild(titleElement);
                for (const variable in snapshot) {
                    if (Object.prototype.hasOwnProperty.call(snapshot, variable)) {
                        if (i === 0) {
                            subElement = document.createElement('h4');
                        } else {
                            subElement = document.createElement('p');
                        }
                        if (variable === 'data') {
                            for (const [key, value] of Object.entries(snapshot.data)) {
                                subElement.textContent = `${key}: ${value}`;
                            }
                        } else {
                            subElement.textContent = `${variable}: ${JSON.stringify(snapshot[variable])}`;
                        }
                        content.appendChild(subElement);
                        i += 1;
                    }
                }
                disp.replaceChild(content, prevContent);
                disp.style.display = 'block';
                disp.style.opacity = '0.5';
                setTimeout(function () {
                    disp.style.opacity = '1.0';
                    disp.style.display = 'none';
                }, 6000);
            }
        } else if (topic == TOPIC_ARENA_CONFIG){
            const config = JSON.parse(msg);
            console.log('Config:Arena', config);
            if (window.environment){
                window.environment.update(config);
            }
        }
    }

    subscribe(topic, callback) {
        const subTopic = window.channel + '/' + topic;
        this.client.subscribe(subTopic);
        console.log('MQTT: subscribed', subTopic);
        if (callback != null) callback();
    }

    publish(topic, message, callback) {
        var payload = new MQTT.Message(message);
        const pubTopic = window.channel + '/' + topic;
        payload.destinationName = pubTopic;
        this.client.send(payload);
        console.log('MQTT: published', pubTopic);

        if (callback != null) callback();
    }
}
