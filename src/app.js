
var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        var node = new TurnCardNode(cc.size(20, 20), res.poke_bg_png, res.poke_front_png);
        this.addChild(node);

        node.x = 0;
        node.y = 0;
        node.updateGridRect();

        // var result = new cc.Grid3D(cc.size(5, 5), cc.rect(0, 0, 100, 100));
        // result.setNeedDepthTestForBlit(true);

        return true;
    },
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

var TurnCardNode = cc.Node.extend({
    _gridSize:null,
    _bgNode:null,
    _frontNode:null,
    _bgGrid:null,
    _frontGrid:null,
    _edgeX:40,
    _hidding:true,

    ctor: function(gridSize, bgRes, frontRes){
        cc.Node.prototype.ctor.call(this);
        this._gridSize = gridSize;
        this._bgNode = this.createNode(bgRes);
        this._bgGrid = this._bgNode.getGrid();
        this._frontNode = this.createNode(frontRes);
        this._frontGrid = this._frontNode.getGrid();
        this.setTouchEnabled(true);
        this.updateGridRect();
    },

    showFront: function(){
        this.reset();
    },
    reset: function(){
        this._bgNode.getGrid().setActive(true);
        this._frontNode.getGrid().setActive(true);

        this.updateOffsetY(0);
        this._hidding = true;
    },
    createNode: function(res){
        var nodeGrid = new cc.NodeGrid();
        this.addChild(nodeGrid);

        var image = new cc.Sprite(res);
        nodeGrid.addChild(image);

        var size = image.getContentSize();
        image.x = size.width / 2;
        image.y = size.height / 2;
        this.setContentSize(size);

        var grid = this.getGrid(size);
        nodeGrid.setGrid(grid);
        grid.setActive(true);
        return nodeGrid;
    },

    updateGridRect: function(){
        var rect = this.getBoundingBoxToWorld();

        this._bgGrid.setGridRect(rect);
        this._frontGrid.setGridRect(rect);

        var stepX = rect.width / this._gridSize.width;
        var stepY = rect.height / this._gridSize.height;
        var step = {x:stepX, y :stepY};
        this._bgGrid.setStep(step);
        this._frontGrid.setStep(step);
        this._bgGrid.calculateVertexPoints();
        this._frontGrid.calculateVertexPoints();
    },

    getGrid: function(size){
        var result = new cc.Grid3D(this._gridSize, cc.rect(0,0,0,0));
        result.setNeedDepthTestForBlit(true);
        return result;
    },

    getOriginalVertex: function(p){
        var v = cc.p()
    },

    calculateHorizontalVertexPoints: function(grid, offsetY, isFront){
        var rect = grid.getGridRect();
        var ay = offsetY;
        var R = 50;

        var locGridSize = grid.getGridSize();
        var locVer = cc.p(0, 0);
        var midX = rect.width / 2;
        var addWidth = this._edgeX;
        var addPerX = addWidth / midX;
        for (var i = 0; i <= locGridSize.width; ++i) {
            for (var j = 0; j <= locGridSize.height; ++j) {

                locVer.x = i;
                locVer.y = j;
                // Get original vertex
                var p = grid.getOriginalVertex(locVer);
                p.y -= rect.y;
                var isTurn
                if(p.y <= ay){
                    var beta = (ay - p.y) / R;
                    if(beta > Math.PI){
                        p.x += (p.x - midX) * addPerX;
                        p.y = ay + (beta - Math.PI) * R;
                        p.z = 2 * R / 7;
                        isTurn = true;
                    } else{
                        if(beta > Math.PI / 2){
                            p.x += (p.x - midX) * addPerX * Math.cos(Math.PI - beta);
                        }
                        
                        p.y = ay - R * Math.sin(beta);
                        p.z = R - R * Math.cos(beta);
                        p.z /=7;
                        isTurn = beta / Math.PI * 180 >= 85;
                    }
                    if(p.z <= 0.5)
                        p.z = 0.5;
                    if(isFront){
                        p.z += isTurn ? 0.1 : -0.1;
                    }
                }
                p.y += rect.y;
                                
                grid.setVertex(locVer, p);
            }
        }
    },

    updateOffsetY: function(offsetY){
        this.calculateHorizontalVertexPoints(this._bgGrid, offsetY);
        this.calculateHorizontalVertexPoints(this._frontGrid, offsetY, true);
    },

    _touchListener:null,
    setTouchEnabled: function (enable) {
        if (enable) {
            if (!this._touchListener)
                this._touchListener = cc.EventListener.create({
                    event: cc.EventListener.TOUCH_ONE_BY_ONE,
                    swallowTouches: true,
                    onTouchBegan: this.onTouchBegan.bind(this),
                    onTouchMoved: this.onTouchMoved.bind(this),
                    onTouchEnded: this.onTouchEnded.bind(this)
                });
            cc.eventManager.addListener(this._touchListener, this);
        } else {
            cc.eventManager.removeListener(this._touchListener);
        }
    },

    onTouchBegan: function(touch, event){
        if(!this._hidding){
            this.reset();
            return;
        }

        var pt = touch.getLocation();
        var size = this.getContentSize();
        var bb = cc.rect(0, 0, size.width, size.height);
        return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
    },
    onTouchMoved: function (touch, event) {
        var touchPoint = touch.getLocation();
        var startPoint = touch.getStartLocation();
        // var point = this.convertToNodeSpace(touchPoint);
        var offsetY = touchPoint.y - startPoint.y;
        if(offsetY <= 0){
            return;
        }
        // cc.renderer.childrenOrderDirty = true;
        this.calculateHorizontalVertexPoints(this._bgGrid, offsetY);
        this.calculateHorizontalVertexPoints(this._frontGrid, offsetY, true);
    },
    onTouchEnded: function (touch, event) {
        var touchPoint = touch.getLocation();
        var startPoint = touch.getStartLocation();
        var dy = touchPoint.y - startPoint.y;
        if(dy > this._bgGrid.getGridRect().height / 2){
            this.showFront();
        } else{
            this.updateOffsetY(0);     
        }
    },
});

