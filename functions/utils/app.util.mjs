export class AppUtil {
    /**
     *
     * @param name
     * @return {string}
     * @public
     */
    static firstCaseUpper(name) {
        return name.toLowerCase().split('').map((value, index, array) => {
            if (index === 0) {
                return value.toUpperCase();
            }
            return value;
        }).join('');
    }

    static getInjectionsFromFile(file) {
        const reg = new RegExp('(constructor).*\:(.|\\n)+?\\)', 'ig');
        const results = file.toString().match(reg) ? file.toString().match(reg)[0] : [];
        if (results) {
            return results.toString()
                .replace(new RegExp('(constructor.*\\()|(private)|(readonly)|\\)', 'gim'), '')
                .split(',')
                .filter(x => x !== '')
                .map(x => {
                    return {
                        name: x.split(':')[0]
                            ? x.split(':')[0].trim()
                            : '',
                        service: x.split(':')[1]
                            ? x.split(':')[1].replace('Service', '').toLowerCase().trim()
                            : ''
                    }
                });
        } else {
            return [];
        }
    }

    static getMethodsFromFile(file) {
        const reg = new RegExp(`(async)+.*`, 'gim');
        const results = file.toString().match(reg) ? file.toString().match(reg) : [];
        const indexes = results.map(x => {
            return file.toString().indexOf(x);
        }).filter(x => x > 0);
        const methods = indexes.map((value, index, array) => {
            if (index === indexes.length - 1) {
                let closingTag = file.toString().lastIndexOf("}");
                return file.toString().substring(value, closingTag);
            }
            return file.toString().substring(value, indexes[index + 1]);
        });
        if (methods) {
            return methods.map(x => {
                const inputsMatch = x.toString().trim().match(new RegExp("\\(.*\\)"));
                let inputs = inputsMatch ? inputsMatch.toString() : '';
                inputs = inputs.substring(1, inputs.length - 1)
                let methodBody = x.toString().replace(new RegExp('(async)+.*', 'gim'), '').trim();
                methodBody = methodBody.substring(0, methodBody.lastIndexOf('}'));
                return {
                    name: x.toString().trim().match(new RegExp('^[\\w\\d\\s]*')).toString().replace("async", "").trim(),
                    inputs: inputs.trim(),
                    return: "any",
                    body: methodBody
                }
            });
        } else {
            return [];
        }
    }

    static getConstructorBodyFromModuleFile(moduleFile) {
        const reg = new RegExp('(constructor).*(.|\\n)*\}.*\\/\\/.*(end)');
        let result = moduleFile.toString().match(reg) ? moduleFile.toString().match(reg)[0] : [];
        if (result) {
            result = result.toString()
                .replace(new RegExp('(constructor).*:(.|\\n)+?\\).*', 'ig'), '')
                .replace(new RegExp('(constructor).*(.|\\n)+?\\).*', 'ig'), '')
                .replace(new RegExp('\}.*(end)', 'ig'), '')
                .trim()
            return result;
        } else {
            return '';
        }
    }
}
