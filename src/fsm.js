class Action {
    constructor(actionName, state, prevAction) {
        this.name = actionName;
        this.state = state;
        this.prev = prevAction;
    }
}

class FSM {
    /**
     * Creates new FSM instance.
     * @param config
     */
    constructor(config) {
        this.state = this.initialState = config.initial;
        var action = new Action('initial', this.initialState, null);
        this.history = [action];
        this.states = config.states;
    }

    /**
     * Returns active state.
     * @returns {String}
     */
    getState() {
        return this.state;
    }

    /**
     * Goes to specified state.
     * @param state
     */
    changeState(state) {
        if(!this.states[state]) throw new Error('Error');
        var action = new Action(
            'change',
            state,
            this.history[this.history.length - 1]
        );
        this.state = action.state;
        this.history.push(action);
    }

    /**
     * Changes state according to event transition rules.
     * @param event
     */
    trigger(event) {
        if(!this.states[this.state].transitions[event]) throw new Error('Error');
        var action = new Action(
            'trigger',
            this.states[this.state].transitions[event],
            this.history[this.history.length - 1]
        );
        this.state = action.state;
        this.history.push(action);
    }

    /**
     * Resets FSM state to initial.
     */
    reset() {
        var action = new Action(
            'reset',
            this.initialState,
            this.history[this.history.length - 1]
        )
        this.state = action.state;
        this.history.push(action);
    }

    /**
     * Returns an array of states for which there are specified event transition rules.
     * Returns all states if argument is undefined.
     * @param event
     * @returns {Array}
     */
    getStates(event) {
        
        var arrStates = [];
        var arrAllStates = [];
        for(var key in this.states) {
            arrAllStates.push(key);
            if(this.states[key].transitions[event]) arrStates.push(key);
        }
        if(arrStates.length) return arrStates;
        if(!event) return arrAllStates;
        return [];
    }

    /**
     * Goes back to previous state.
     * Returns false if undo is not available.
     * @returns {Boolean}
     */
    undo() {
        if(this.history[this.history.length - 1].prev) {
            var action = new Action(
                'undo',
                this.history[this.history.length - 1].prev.state,
                this.history[this.history.length - 1].prev.prev
            )
            this.state = action.state;
            this.history.push(action);
            return true;
        }
        return false;
    }

    /**
     * Goes redo to state.
     * Returns false if redo is not available.
     * @returns {Boolean}
     */
    redo() {
        if(this.history.length > 1
            && this.history[this.history.length - 1].name == 'undo') {
            this.history.pop();
            this.state = this.history[this.history.length - 1].state;
            return true;
        }
        return false;
    }

    /**
     * Clears transition history
     */
    clearHistory() {
        this.history[this.history.length - 1].prev = null;
        this.history = this.history.splice(this.history.length - 1, 1);
    }
}

const config = {
    initial: 'normal',
    states: {
        normal: {
            transitions: {
                study: 'busy',
            }
        },
        busy: {
            transitions: {
                get_tired: 'sleeping',
                get_hungry: 'hungry',
            }
        },
        hungry: {
            transitions: {
                eat: 'normal'
            },
        },
        sleeping: {
            transitions: {
                get_hungry: 'hungry',
                get_up: 'normal',
            },
        },
    }
};

const student = new FSM(config);

student.getStates();

module.exports = FSM;

/** @Created by Uladzimir Halushka **/
