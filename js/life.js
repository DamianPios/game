function $ (selector, container) {
    return(container || document).querySelector(selector);
}
;


(function () {
    var _ = self.Life = function (seed) {
        this.seed = seed;
        this.height = seed.length;
        this.width = seed[0].length;
        this.prevBoard = [];
        this.board = cloneArray(seed);
    };
    _.prototype = {
        next: function () {
            this.prevBoard = cloneArray(this.board);

            for(var y = 0; y < this.height; y++) {
                for(var x = 0; x < this.width; x++) {
                    var neighbors = this.aliveNeighbors(this.prevBoard, x, y);
                    var alive = !!this.board[y][x];

                    if(alive) {
                        if(neighbors < 2 || neighbors > 3) {
                            this.board[y][x] = 0;
                        }
                    } else {
                        if(neighbors == 3) {
                            this.board[y][x] = 1;
                        }
                    }
                }
            }
        },
        aliveNeighbors: function (array, x, y) {

            var prevRow = array[y - 1] || [];
            var nextRow = array[y + 1] || [];

            return [
                prevRow[x - 1], prevRow[x], prevRow[x + 1],
                array[y][x - 1], array[y][x + 1],
                nextRow[x - 1], nextRow[x], nextRow[x + 1]
            ].reduce(function (prev, cur) {
                return prev + +!!cur;
            }, 0);
        },

        toString: function () {
            return this.board.map(function (row) {
                return row.join(' ');
            }).join('\n');
        }
    };
    //helper
    function cloneArray (array) {
        return array.slice().map(function (row) {
            return row.slice();
        });
    }
    ;
}());

(function () {
    var _ = self.LifeView = function (table, size) {
        this.grid = table;
//        console.log(this.grid);
        this.size = size;
        this.started = false;
        this.autoplay = false;

        this.createGrid();
    };

    _.prototype = {
        createGrid: function () {
            var me = this;

            var fragment = document.createDocumentFragment();
            this.grid.innerHTML = '';
            this.checkboxes = [];

            for(var y = 0; y < this.size; y++) {
                var row = document.createElement('tr');
                this.checkboxes[y] = [];

                for(var x = 0; x < this.size; x++) {
                    var cell = document.createElement('td');
                    var checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = 'cell';
                    this.checkboxes[y][x] = checkbox;
                    checkbox.coords = [y, x];

                    cell.appendChild(checkbox);
                    row.appendChild(cell);
                }

                fragment.appendChild(row);
            }

            this.grid.addEventListener('change', function (evt) {
                if(evt.target.nodeName.toLowerCase() == 'input') {
                    me.stop();
                }
            });

            this.grid.addEventListener('keyup', function (evt) {
                var checkbox = evt.target;
                if(checkbox.nodeName.toLowerCase() == 'input') {
                    var coords = checkbox.coords;
                    var y = coords[0];
                    var x = coords[1];

                    switch(evt.keyCode) {
                        case 37:
                            if(x > 0) {
                                me.checkboxes[y][x - 1].focus();
                            } else {
                                me.checkboxes[y][me.size - 1].focus();
                            }
                            break;
                        case 38:
                            if(y > 0) {
                                me.checkboxes[y - 1][x].focus();
                            } else {
                                me.checkboxes[me.size - 1][x].focus();
                            }
                            break;
                        case 39:
                            if(x < me.size - 1) {
                                me.checkboxes[y][x + 1].focus();
                            } else {
                                me.checkboxes[y][0].focus();
                            }

                            break;
                        case 40:
                            if(y < me.size - 1) {
                                me.checkboxes[y + 1][x].focus();
                            } else {
                                me.checkboxes[0][x].focus();
                            }
                            break;
                    }
                }
            });

            this.grid.appendChild(fragment);
        },

        get boardArray () {
            return this.checkboxes.map(function (row) {
                return row.map(function (checkbox) {
                    return +checkbox.checked;
                });
            });
        },

        stop: function () {
            this.started = false;
        },

        play: function () {
            this.game = new Life(this.boardArray);
            this.started = true;
        },

        next: function () {
            clearTimeout(this.timer);
            var me = this;
            if(!this.started || this.game) {
                this.play();
            }
            this.game.next();

            var board = this.game.board;

            for(var y = 0; y < this.size; y++) {
                for(var x = 0; x < this.size; x++) {
                    this.checkboxes[y][x].checked = !!board[y][x];
                }
            }

            if(this.autoplay) {
                this.timer = setTimeout(function () {
                    me.next();
                }, 1000);
            }
        }
    };
}());
(function () {

    var buttons = {
        next: $('button.next')
    };

    var lifeView = new LifeView(document.getElementById('grid'), 12);

    buttons.next.addEventListener('click', function () {
        lifeView.next();
    });

    $('#autoplay').addEventListener('change', function () {
        buttons.next.textContent = this.checked ? 'Start' : 'Next';

        lifeView.autoplay = this.checked;

        if(!this.checked) {
            clearTimeout(lifeView.timer);
        }
    });
    $('#cell').addEventListener('click', function () {

        if(/*lifeView.started*/ true) {
//            lifeView.started = false;
            console.log('mousedown');
        }
    });
}());