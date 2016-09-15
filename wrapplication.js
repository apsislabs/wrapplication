import _ from 'lodash';

class Wrapplication {
    constructor({callbacks = {}, globalKey = '*', entryKey = '_wr_cbs'} = {}) {
        this._callbacks = callbacks;
        this._globalKey = globalKey;
        this._entryKey = entryKey;
    }

    registerAction(namespace, callback, priority = 0) {
        // Defend callbacks against foolish behavior
        if ( namespace.includes(this._entryKey) ) {
            throw new Error(`Registered namespace matches reserved entryKey: ${this._entryKey}.`);
        } else if ( !_.isFunction(callback) ) {
            throw new TypeError(`Cannot register callback of type: ${typeof callback}`);
        }

        // Get callbacks, return an empty object by default
        let key = `${namespace}.${this._entryKey}[${priority}]`;
        let callbacks = _.get(this._callbacks, key, []);

        _.set(this._callbacks, key, _.concat(callbacks, callback));
    }

    registerGlobalAction(callback, priority = 0) {
        this.registerAction(this._globalKey, callback, priority);
    }

    run(namespaces, runDefaults = true) {
        if ( !_.isArray(namespaces) ) { namespaces = [namespaces]; }
        if ( runDefaults ) { namespaces.push(this._globalKey); }

        _.each(namespaces, (n) => {
            this._runNamespace(n);
        }
    }

    _runNamespaces(namespace) {
        let entries = _.get(this._callbacks, namespace, {});
        let namespaces = getValuesDeep(entries, this._entryKey);

        _.forEach(namespaces, (n) => {
            _.forEach(_.reverse(n), (priorityLevel) => {
                _.forEach(priorityLevel, (func) => {
                    if ( _.isFunction(func) ) {
                        func();
                    } else {
                        console.warn(`Attempted to execute a callback of type: ${typeof f}`);
                        console.warn("\t", f);
                    }
                });
            });
        });
    }
}

function getValuesDeep(haystack, needle) {
    let results = [];

    _.forEach(haystack, (v, k) => {
        if ( k === needle ) {
            results.push(v);
        } else {
            results = results.concat(getValuesDeep(v, needle));
        }
    });

    return results;
}

// TESTING
let wrap = new Wrapplication();

wrap.registerAction('inbox._wr_cbs', () => { console.log("test inbox 1"); }, 1);
wrap.registerAction('inbox.show', () => { console.log("test 5"); }, 5);
wrap.registerAction('inbox.show', () => { console.log("test 0"); }, 0);
wrap.registerAction('inbox.show', () => { console.log("test 25"); }, 25);
wrap.registerAction('inbox.show', () => { console.log("test 25 2"); }, 25);
wrap.registerAction('inbox.show.nested', () => { console.log("test nested 0"); });

wrap.run('inbox');
