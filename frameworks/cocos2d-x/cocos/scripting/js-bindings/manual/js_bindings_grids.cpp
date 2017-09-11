#include "scripting/js-bindings/manual/jsb_binds_grids.h";
#include "scripting/js-bindings/manual/ScriptingCore.h";
#include "scripting/js-bindings/manual/cocos2d_specifics.hpp";
#include "cocos2d.h";

static bool js_cocos2dx_Grid3D_getOriginalVertex(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::Grid3D* cobj = (cocos2d::Grid3D *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_Grid3D_getOriginalVertex : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Vec2 arg0;
        ok &= jsval_to_vector2(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_Grid3D_getOriginalVertex : Error processing arguments");

        const cocos2d::Vec3& ret = cobj->getOriginalVertex(arg0);
        JS::RootedValue jsret(cx);
        jsret = vector3_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_Grid3D_getOriginalVertex : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}

static bool js_cocos2dx_Grid3D_setVertex(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::Grid3D* cobj = (cocos2d::Grid3D *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_Grid3D_setVertex : Invalid Native Object");
    if (argc == 2) {
        cocos2d::Vec2 arg0;
        ok &= jsval_to_vector2(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_Grid3D_setVertex : Error processing arguments");
        cocos2d::Vec3 arg1;
        ok &= jsval_to_vector3(cx, args.get(1), &arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_Grid3D_setVertex : Error processing arguments");
        cobj->setVertex(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_Grid3D_setVertex : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}


extern JSObject* jsb_cocos2d_Grid3D_prototype;

void register_all_cocos2dx_grids_manual(JSContext* cx, JS::HandleObject global)
{
    JS::RootedObject proto(cx, jsb_cocos2d_Grid3D_prototype);
    JS_DefineFunction("getOriginalVertex", js_cocos2dx_Grid3D_getOriginalVertex, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
    JS_DefineFunction("setVertex", js_cocos2dx_Grid3D_setVertex, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
}
