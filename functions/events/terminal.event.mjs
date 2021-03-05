import bfastnode from "bfastnode";
import {StorageUtil} from "../utils/storage.util.mjs";
import {platform} from 'os';
import {spawn} from 'node-pty-prebuilt-multiarch';
import {resolve} from 'path';

const shell = platform() === 'win32' ? 'cmd.exe' : 'bash';
const terminals = {};

const storage = new StorageUtil();
const {bfast} = bfastnode;
const END_OF_LINE = '\x1B[1;32mbfast :~\x1B[0m$';

function initiateTerm(project, path, response) {
    if (!terminals[project]) {
        terminals[project] = spawn(shell, [], {
            name: 'bfast-terminal',
            cols: 1000,
            rows: 700,
            cwd: resolve(path, '../../'),
            env: process.env
        });
        terminals[project].on('data', function (data) {
            // if (data.toString().trim() === '^C') {
            //     response.broadcast(END_OF_LINE);
            //     ending = true;
            // } else {
            //     if (ending === true) {
            //         ending = false;
            //     } else {
            //         const value = data.toString().match(new RegExp('.*@.*:.*'));
            //         if (value) {
            //             response.broadcast(END_OF_LINE);
            //         } else {
            if (terminals[project]) {
                terminals[project].isExecute = data.toString().match(new RegExp('.*@.*:.*[#$]', 'i')) === null;
            }
            data = data.toString().replace(new RegExp('.*@.*:.*[#$]', 'i'), END_OF_LINE)
            response.broadcast(data);
            //         }
            //     }
            // }
        });
        terminals[project].on('exit', _ => {
        });
    } else {
        // console.log(`terminal of ${project} already initialized pid --> ` + terminals[project].pid);
    }
}

async function execCommand(cmd, project, response) {
    const projectPath = await storage.getConfig(`${project}:projectPath`);
    initiateTerm(project, projectPath, response);
    if (cmd.toString().trim().startsWith('start')) {
        let other = cmd.toString().replace('start', '').trim();
        terminals[project].write(`npx ng serve ${other}\r`);
    } else if (cmd.toString().startsWith('build')) {
        terminals[project].write(cmd.toString().replace('build', 'npx ng build --prod ').concat('\r'));
    } else if (cmd.toString().startsWith('install')) {
        terminals[project].write(`npm ${cmd}\r`);
    } else if (cmd.toString().trim() === 'stop') {
        terminals[project].write('\x03');
        terminals[project] = undefined;
    } else if (cmd.toString().startsWith('git')) {
        terminals[project].write(`${cmd.toString()}\r`);
    } else {
        if (terminals[project].isExecute === true) {
            terminals[project].write(`${cmd.toString()}\r`);
        } else {
            // terminals[project].write(`^C`);
            response.broadcast(`no`);
        }
    }
}

export const terminalEvent = bfast.functions().onEvent(
    '/terminal',
    (request, response) => {
        const project = request.auth ? request.auth.project : undefined;
        const body = request.body;
        if (!project) {
            response.broadcast('INFO: unknown project, add in auth object when establish connection');
            response.broadcast(END_OF_LINE);
        } else {
            if (body && body.command) {
                execCommand(body.command.toString().trim(), project, response).catch(reason => {
                    console.log(reason);
                    response.broadcast(reason && reason.message ? reason.message : reason.toString());
                    response.broadcast('\r\n');
                });
            } else {
                response.broadcast('INFO: unknown value command');
                response.broadcast(END_OF_LINE);
            }
        }
    }
);
