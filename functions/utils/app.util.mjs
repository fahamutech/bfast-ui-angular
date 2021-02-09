export class AppUtil {
    /**
     *
     * @param name
     * @return {string}
     * @public
     */
    firstCaseUpper(name) {
        return name.split('').map((value, index) => {
            if (index === 0) {
                return value.toUpperCase();
            }
            return value;
        }).join('');
    }

    /**
     *
     * @param kebalCase {string}
     * @return {string}
     */
    kebalCaseToCamelCase(kebalCase) {
        return kebalCase
            .trim()
            .split('-')
            .map(y => this.firstCaseUpper(y))
            .join('')
    }

    /**
     *
     * @param camelCase {string}
     * @return {string}
     */
    camelCaseToKebal(camelCase) {
        let guardNameParts = camelCase.match(new RegExp('[A-Z][a-z0-9]+', 'g'));
        if (guardNameParts) {
            return guardNameParts.map(x => x.toLowerCase()).join('-');
        } else {
            return camelCase;
        }
    }

    getInjectionsFromFile(file) {
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

    getMethodsFromFile(file) {
        const reg = new RegExp(`(async)(.|\\n)+?\\((.|\\n)+?(:(.|\\n)+?Promise.*<)`, 'gim');
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
                const inputsMatch = x.toString().trim().match(reg);
                let inputs = inputsMatch ? inputsMatch.toString() : '';
                inputs = inputs
                    .replace(new RegExp('(async)(.|\\n)+?\\(', 'ig'), '')
                    .replace(new RegExp('\\)(\\W|\\n)*\\:(\\W|\\n)*Promise(\\W|\\n)*<', 'ig'), '')
                    .trim();
                let methodBody = x.toString()
                    .replace(new RegExp('(async)(.|\\n)+?\\((.|\\n)+?:(.|\\n)+?(Promise.*<.*>(\\W|\\n)*\\{)', 'gi'), '')
                    .trim();
                methodBody = methodBody
                    .substring(0, methodBody.lastIndexOf('}'))
                    .trim();
                return {
                    name: x.toString().match(new RegExp('(async)(.|\\n)+?\\(')) ?
                        x.toString().match(new RegExp('(async)(.|\\n)+?\\('))[0]
                            .toString()
                            .replace(new RegExp('async', 'ig'), '')
                            .replace(new RegExp('\\(', 'ig'), '')
                            .trim() : 'noname',
                    inputs: inputs.trim(),
                    return: "any",
                    body: methodBody
                }
            });
        } else {
            return [];
        }
        // const reg = new RegExp(`(async).*\\((.|\\n)+?(:.*Promise<).*(.|\\n)+?\\}`, 'gim');
        // const methods = file.toString().match(reg) ? file.toString().match(reg) : [];
        // const indexes = results.map(x => {
        //     return file.toString().indexOf(x);
        // }).filter(x => x > 0);
        // const methods = indexes.map((value, index, array) => {
        //     if (index === indexes.length - 1) {
        //         let closingTag = file.toString().lastIndexOf("}");
        //         return file.toString().substring(value, closingTag);
        //     }
        //     return file.toString().substring(value, indexes[index + 1]);
        // });
        // if (methods) {
        //     return methods.map(x => {
        //
        //         const inputsMatch = x.toString().trim().match(new RegExp("(async).*\\((.|\\n)+?(:.*Promise<)", 'ig'));
        //         let inputs = inputsMatch ? inputsMatch[0].toString()
        //             .replace(new RegExp('(\\)(\\s)*:.*Promise<)', 'ig'), '')
        //             .replace(new RegExp('(async).+?\\(', 'ig'), '')
        //             .trim() : '';
        //         // inputs = inputs.substring(0, inputs.lastIndexOf(')')).trim();
        //         // inputs = inputs.substring(0, inputs.length - 1);
        //         let methodBody = x.toString().replace(new RegExp('(async)(.|\\n)+?:.*Promise<.*\\{', 'gim'), '').trim();
        //         methodBody = methodBody.substring(0, methodBody.lastIndexOf('}'));
        //         return {
        //             name: x.toString().trim().match(new RegExp('^[\\w\\d\\s]*')).toString().replace("async", "").trim(),
        //             inputs: inputs.trim(),
        //             return: "any",
        //             body: methodBody
        //         }
        //     });
        // } else {
        //     return [];
        // }
    }

    getConstructorBodyFromModuleFile(moduleFile) {
        const reg = new RegExp('(constructor).*(.|\\n)*}(.|\\n)*\\/\\/(\\s|\\n)*(end)', 'ig');
        let result = moduleFile.toString().match(reg) ? moduleFile.toString().match(reg)[0] : null;
        // console.log(result);
        if (result) {
            result = result.toString()
                .replace(new RegExp('(constructor)(\\W|\\n){0,}?\\((.|\\s|\\n){0,}?\\)(\\W|\\n)*\\{', 'ig'), '')
                // .replace(new RegExp('(constructor).*(.|\\n)+?\\).*', 'ig'), '')
                .replace(new RegExp('}(\\s|\\n)*\\/\\/(.|\\n)*(end)', 'ig'), '')
                .trim()
            return result;
        } else {
            return '';
        }
    }
}
