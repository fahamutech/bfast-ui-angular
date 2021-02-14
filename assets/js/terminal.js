function terminalIsOpen() {
    return document.getElementById('terminal').children.length > 0;
}
let terminalEvents;
let bfastTerminal;

function autoStartTerminal(project) {
    const value = localStorage.getItem('terminal');
    if (value && value === 'open') {
        startTerminal(project);
    }
}

function closeTerminal() {
    if (bfastTerminal) {
        bfastTerminal.dispose();
        terminalEvents.close();
        localStorage.setItem('terminal', 'close');
    }
}

function startTerminal(project) {
    if (location.pathname.trim().split('/').filter(x => x.trim() !== '').length <= 1) {
        return;
    }
    if (!project || project.toString().trim() === '') {
        console.error('specify project name when start terminal');
        return
    }
    if (terminalIsOpen() === false) {
        bfast.init({
            functionsURL: `http://${location.host}`,
            databaseURL: `http://${location.host}`
        });

        bfastTerminal = new Terminal({
            cursorBlink: true,
            rows: 10
        });
        //  const initialTermText = '$ ';
        let curr_line = '';
        terminalEvents = bfast.functions().event('/terminal', _ => {
            console.log('terminal connected');
            if (location.pathname.trim() === '/project') {
                terminalEvents.close();
            }
        }, _ => {
            console.log('terminal disconnected');
        });

        bfastTerminal.open(document.getElementById('terminal'));
        bfastTerminal.prompt = () => {
            bfastTerminal.write('\r\n\x1B[1;32mbfast :~\x1B[0m$ ');
        };
        bfastTerminal.help = () => {
            bfastTerminal.writeln('');
            bfastTerminal.writeln('bfast ui shell.');
            bfastTerminal.writeln('--------Commands----------');
            bfastTerminal.writeln('start --> start a angular dev server');
            bfastTerminal.writeln('stop --> stop angular dev server');
            bfastTerminal.writeln('install --> install dependencies');
            bfastTerminal.writeln('build --> build for production');
            bfastTerminal.writeln('exit --> close terminal');
        }
        bfastTerminal.exec = (_command) => {
            const command = _command && _command.toString().trim()
            if (command.length > 0) {
                if (command === 'exit') {
                    closeTerminal();
                } else {
                    terminalEvents.emit({body: {command: command}, auth: {project: project}});
                }
            }
        }

        bfastTerminal.writeln('bfast ui shell.');
        bfastTerminal.prompt();
        bfastTerminal.textarea.onkeydown = function (ev) {
            const printable = ev.key.length === 1;
            if (ev.key === 'Enter') {
                if (curr_line.trim().startsWith('reset')) {
                    bfastTerminal.reset();
                    bfastTerminal.prompt();
                } else if (curr_line.trim().startsWith('clear')) {
                    bfastTerminal.clear();
                    bfastTerminal.prompt();
                } else if (curr_line.trim().startsWith('help')) {
                    bfastTerminal.help();
                    bfastTerminal.prompt();
                } else {
                    bfastTerminal.writeln('');
                    bfastTerminal.exec(curr_line);
                }
                curr_line = '';
            } else if (ev.key === 'Backspace') {
                if (curr_line.length > 0) {
                    curr_line = curr_line.slice(0, -1);
                    bfastTerminal.write('\b \b');
                }
            } else if (printable) {
                curr_line += ev.key;
                // console.log(curr_line, ev.key);
                bfastTerminal.write(ev.key);
            }
        }
        terminalEvents.listener(response => {
            const msg = response.body;
            if (msg && msg.toString().trim().startsWith('efl')) {
                bfastTerminal.prompt();
            } else {
                bfastTerminal.write(msg);
            }
        });
        localStorage.setItem('terminal', 'open');
    } else {
        console.log('terminal instance already open');
    }
}
