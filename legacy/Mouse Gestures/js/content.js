/*!
 * ---------------------------------------------------------
 * Copyright(C) Microsoft Corporation. All rights reserved.
 * ---------------------------------------------------------
 */
(function(){function e(n,t){this.X=n;this.Y=t}var n={DIRECTION_LENGTH_THRESHOLD:2,POINT_DISTANCE_THRESHOLD:5,INITIAL_PATH_POINTS_LENGTH_THRESHOLD:10,TOLERANT_DISTANCE_THRESHOLD_POW:2500,ACTION:{Forward:function(){window.history.forward()},Back:function(){window.history.back()},OpenNewTab:function(){t.sendMessageToBackground({action:"Open New Tab"})},CloseCurrentTab:function(){t.sendMessageToBackground({action:"Close Current Tab"})},CloseAllTabs:function(){t.sendMessageToBackground({action:"Close All Tabs"})},CloseAllTabsExceptCurrent:function(){t.sendMessageToBackground({action:"Close All Tabs Except Current"})},ScrollUp:function(){window.scrollBy(0,-300)},ScrollDown:function(){window.scrollBy(0,300)},ScrollLeft:function(){window.scrollBy(-100,0)},ScrollRight:function(){window.scrollBy(100,0)},ScrollToTop:function(){window.scrollTo(0,0)},ScrollToBottom:function(){window.scrollTo(0,document.body.scrollHeight)},RefreshCurrentTab:function(){document.location.reload(!0)},StopLoading:function(){r.isMSBrowser?document.execCommand("Stop"):window.stop()}},pathPoints:[],lastPoint:null,currentDirections:[],currentActionName:null,tolerantPointsRange:{minX:Number.MAX_VALUE,minY:Number.MAX_VALUE,maxX:Number.MIN_VALUE,maxY:Number.MIN_VALUE,getDistance:function(){return Math.pow(this.maxX-this.minX,2)+Math.pow(this.maxY-this.minY,2)},updateRange:function(n){this.minX=Math.min(this.minX,n.X);this.minY=Math.min(this.minY,n.Y);this.maxX=Math.max(this.maxX,n.X);this.maxY=Math.max(this.maxY,n.Y)},resetRange:function(){this.minX=Number.MAX_VALUE;this.minY=Number.MAX_VALUE;this.maxX=Number.MIN_VALUE;this.maxY=Number.MIN_VALUE}},shouldStopTolerant:function(n){this.tolerantPointsRange.updateRange(n);var t=this.tolerantPointsRange.getDistance();return t>this.TOLERANT_DISTANCE_THRESHOLD_POW},filterPoints:function(n,t){this.shouldStopTolerant(n)&&(t(),this.tolerantPointsRange.resetRange())},recognize:function(n){var r="",t=this.currentDirections.length,i;return t===0?this.filterPoints(n,function(){var t=gestureRecognizer.getDirection(n,this.lastPoint,!0);this.currentDirections.push(t);r=this.getActionNameFromDirections(this.currentDirections)}.bind(this)):t>0&&t<this.DIRECTION_LENGTH_THRESHOLD?(i=gestureRecognizer.getDirection(n,this.lastPoint,!0),(i==="NO_DIRECTION"||i!==this.currentDirections[t-1])&&this.filterPoints(n,function(){this.currentDirections.push(i);r=this.getActionNameFromDirections(this.currentDirections)}.bind(this))):t===this.DIRECTION_LENGTH_THRESHOLD?this.filterPoints(n,function(){var i=gestureRecognizer.getDirection(n,this.lastPoint,!1);i!==this.currentDirections[t-1]&&(r="NoMatch")}.bind(this)):(i=gestureRecognizer.getDirection(n,this.lastPoint,!1),i!==this.currentDirections[t-1]&&(r="NoMatch")),r},getActionNameFromDirections:function(n){for(var t="",i=0;i<n.length;i++)t+=n[i];return f.user_setting.gesturesMapping[t]?f.user_setting.gesturesMapping[t]:"NoMatch"}},r={RIGHT_BUTTON_NUMBER:2,CONTEXT_MENU_POINT_THRESHOLD:5,isMSBrowser:!0,shouldShowContextMenu:!0,shouldTriggerDragEvent:!1,actionI18nString:{},mouseDownEventName:"mousedown",mouseMoveEventName:"mousemove",mouseUpEventName:"mouseup",mouseLeaveEventName:"mouseleave",lastPointerType:null,initMSBrowser:function(){typeof msBrowser!="undefined"?(chrome=msBrowser,this.isMSBrowser=!0):typeof browser!="undefined"?(chrome=browser,this.isMSBrowser=!0):this.isMSBrowser=!1;this.isMSBrowser&&(this.mouseDownEventName="pointerdown",this.mouseMoveEventName="pointermove",this.mouseUpEventName="pointerup")},initActionI18nString:function(){var t=Object.keys(f.user_setting.gesturesMapping),i,n,r;for(i in t)n=f.user_setting.gesturesMapping[t[i]],r="action"+n,this.actionI18nString[n]=chrome.i18n.getMessage(r);this.actionI18nString.NoMatch=chrome.i18n.getMessage("actionNoMatch");this.actionI18nString.OpenLinkInNewTab=chrome.i18n.getMessage("actionOpenLinkInNewTab")},initRightMouseEventListener:function(){document.addEventListener(this.mouseDownEventName,function(t){if(this.isRightMouse(t)){var i=new e(t.clientX,t.clientY);n.pathPoints.push(i);n.lastPoint=i}}.bind(this),!1);document.addEventListener(this.mouseMoveEventName,function(t){var i,r,f,o;if(this.isRightMouse(t)&&n.pathPoints.length>0){if(i=new e(t.clientX,t.clientY),n.pathPoints.push(i),r=Math.abs(i.X-n.lastPoint.X),f=Math.abs(i.Y-n.lastPoint.Y),r<n.POINT_DISTANCE_THRESHOLD&&f<n.POINT_DISTANCE_THRESHOLD)return;o=n.recognize(i);n.lastPoint=i;this.updatePathAndLabel(t.clientX,t.clientY,o);this.removeSelectionIfNeeded(t)}else u.actionLabel&&this.reset()}.bind(this),!1);document.addEventListener(this.mouseUpEventName,function(i){this.isRightMouse(i)&&(n.currentActionName&&n.currentActionName!=="NoMatch"&&n.ACTION[n.currentActionName](),n.currentActionName&&(t.sendActionResultToBackground(n.currentActionName),o.sendDailyActiveStateIfAllowedAndNeeded()),this.shouldShowContextMenu=n.pathPoints.length<=this.CONTEXT_MENU_POINT_THRESHOLD,this.reset())}.bind(this),!1);window.top!==window.self&&document.body.addEventListener(this.mouseLeaveEventName,function(){this.shouldTriggerDragEvent||this.reset()}.bind(this),!1);document.addEventListener("contextmenu",function(n){this.shouldShowContextMenu||n.preventDefault();this.shouldShowContextMenu=!0}.bind(this),!1)},initLeftMouseEventListener:function(){document.addEventListener("dragstart",function(n){var t=n.href||n.target.href;t&&(u.initActionDiv("OpenLinkInNewTab"),this.shouldTriggerDragEvent=!0)}.bind(this),!1);document.addEventListener("dragend",function(n){this.reset();var i=n.href||n.target.href;i&&(t.sendMessageToBackground({action:"Open New Tab",url:i}),t.sendActionResultToBackground("OpenLinkInNewTab"),o.sendDailyActiveStateIfAllowedAndNeeded(),this.shouldTriggerDragEvent=!1)}.bind(this),!1)},initTouchEventListener:function(){document.addEventListener("touchstart",function(){this.reset()}.bind(this),!1)},updatePathAndLabel:function(t,r,f){if(!i.pathDiv&&n.pathPoints.length>1&&i.initPathDiv(),i.pathSVG){var e=i.pathSVG.createSVGPoint();e.x=t;e.y=r;i.pathLine&&i.pathLine.points.appendItem(e)}i.pathLine&&f&&(u.actionLabel?u.setActionLabelContent(f):u.initActionDiv(f),n.currentActionName=f)},removePathAndActionDiv:function(){t.removeElement(i.pathDiv);t.removeElement(u.actionDiv)},reset:function(){this.removePathAndActionDiv();this.lastPointerType=null;i.pathDiv=null;i.pathSVG=null;i.pathLine=null;u.actionDiv=null;u.actionLabel=null;n.pathPoints=[];n.lastPoint=null;n.tolerantPointsRange.resetRange();n.currentDirections=[];n.currentActionName=null},isRightMouse:function(n){if(this.isPenGestureEnabled){if(this.lastPointerType&&n.pointerType!==this.lastPointerType)return this.lastPointerType=n.pointerType,!1;if(this.lastPointerType=n.pointerType,this.isMSBrowser&&n.pointerType==="pen")return n.type===this.mouseDownEventName?n.buttons===1:n.type===this.mouseMoveEventName?n.buttons===1:n.type===this.mouseUpEventName?n.button===0:!1}return this.isMSBrowser&&n.pointerType!=="mouse"?!1:n.type===this.mouseUpEventName?n.button==this.RIGHT_BUTTON_NUMBER:n.type===this.mouseDownEventName||n.type===this.mouseMoveEventName?n.buttons?n.buttons===this.RIGHT_BUTTON_NUMBER:n.button===this.RIGHT_BUTTON_NUMBER:!1},removeSelectionIfNeeded:function(n){this.isMSBrowser&&n.pointerType==="pen"&&this.isPenGestureEnabled===!0&&window.getSelection().empty()}},f={user_setting:{enableMouseGesture:!0,enablePenGesture:!0,enableSendTelemetry:!0,gesturesMapping:{R:"Forward",RU:"OpenNewTab",RL:"NoMatch",RD:"RefreshCurrentTab",U:"ScrollUp",UR:"ScrollRight",UL:"ScrollLeft",UD:"ScrollToBottom",L:"Back",LR:"NoMatch",LU:"CloseAllTabs",LD:"StopLoading",D:"ScrollDown",DR:"CloseCurrentTab",DU:"ScrollToTop",DL:"CloseAllTabsExceptCurrent"}},initUserSetting:function(){chrome.storage.local.get(null,function(n){var i=Object.keys(n),u,t;if(i.length!==0)for(u in i)t=i[u],t in this.user_setting&&(this.user_setting[t]=n[t]);else chrome.storage.local.set({enableMouseGesture:this.user_setting.enableMouseGesture,enablePenGesture:this.user_setting.enablePenGesture,enableSendTelemetry:this.user_setting.enableSendTelemetry,gesturesMapping:this.user_setting.gesturesMapping});this.user_setting.enableMouseGesture===!0&&(r.initActionI18nString(),r.initRightMouseEventListener(),r.initLeftMouseEventListener(),r.isMSBrowser||r.initTouchEventListener());r.isPenGestureEnabled=this.user_setting.enablePenGesture}.bind(this))}},o={DURATION_ONE_DAY_IN_MILLISECONDS:864e5,DAILY_ACTIVE_USER_DURATION_IN_DAYS:1,sendDailyActiveStateIfAllowedAndNeeded:function(){chrome.storage.local.get(["lastSendActiveStateTime","enableSendTelemetry"],function(n){var o=n.enableSendTelemetry,f,e;if(o){var r=n.lastSendActiveStateTime,i=!1,u=(new Date).getTime();r?(f=Math.abs(u-r),e=Math.floor(f/this.DURATION_ONE_DAY_IN_MILLISECONDS),i=e>=this.DAILY_ACTIVE_USER_DURATION_IN_DAYS):i=!0;i&&(chrome.storage.local.set({lastSendActiveStateTime:u}),t.sendMessageToBackground({action:"Send Daily Active State"}))}}.bind(this))}},i={SVG_NAMESPACE:"http://www.w3.org/2000/svg",pathDiv:null,pathSVG:null,pathLine:null,initPathDiv:function(){t.checkIfElementExists(this.pathDiv)&&t.removeElement(this.pathDiv);this.pathDiv||(this.pathDiv=document.createElement("div"));this.setPathDivStyle();this.initPathSVG();this.pathDiv.appendChild(this.pathSVG);document.body.appendChild(this.pathDiv)},setPathDivStyle:function(){this.pathDiv.style.cssText="z-index: 9999999 !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important;"},initPathSVG:function(){this.pathSVG||(this.pathSVG=document.createElementNS(this.SVG_NAMESPACE,"svg"));this.setPathSVGStyle();this.initPathLine();this.pathSVG.appendChild(this.pathLine)},setPathSVGStyle:function(){this.pathSVG.style.cssText="width: 100% !important; height: 100% !important;"},initPathLine:function(){this.pathLine=document.createElementNS(this.SVG_NAMESPACE,"polyline");this.initPathLineStyle()},initPathLineStyle:function(){this.pathLine.style.cssText="stroke: #1ba1e2 !important; stroke-width: 7 !important; stroke-linejoin: round !important; stroke-linecap: round !important; fill: none !important;"}},u={actionDiv:null,actionLabel:null,initActionDiv:function(n){t.checkIfElementExists(this.actionDiv)&&t.removeElement(this.actionDiv);this.actionDiv||(this.actionDiv=document.createElement("div"));this.setActionDivStyle();this.initActionLabel(n);this.actionDiv.appendChild(this.actionLabel);document.body.appendChild(this.actionDiv)},setActionDivStyle:function(){this.actionDiv.style.cssText="z-index: 10000000 !important; position: fixed !important; top: 45% !important; left: 0 !important; width: 100% !important; min-width: 44px !important; text-align: center !important;"},initActionLabel:function(n){this.actionLabel||(this.actionLabel=document.createElement("span"));this.setActionLabelStyle();this.actionLabel.textContent=r.actionI18nString[n]},setActionLabelStyle:function(){this.actionLabel.style.cssText="box-sizing: border-box !important; -webkit-box-sizing: border-box !important; -moz-box-sizing: border-box !important; color: black !important; background-color: #fff !important; font-size: 15px !important; padding-left: 13px !important; padding-right: 13px !important; border: 2px solid #0078D7 !important; height: 44px !important; line-height: 40px !important; display: inline-block !important; min-width: 96px !important; white-space: nowrap !important; overflow: hidden !important;";chrome.i18n.getUILanguage()==="zh-CN"?this.actionLabel.style.setProperty("font-family",'"Microsoft Yahei UI", "Microsoft Yahei", Verdana, Simsun, "Segoe UI", "Segoe UI Web", "Segoe UI Symbol", "Helvetica Neue", "BBAlpha Sans", "S60 Sans", Arial, sans-serif',"important"):this.actionLabel.style.setProperty("font-family",'"Segoe UI", "Segoe UI Web", "Segoe UI Symbol", "Helvetica Neue", "BBAlpha Sans", "S60 Sans", Arial, sans-serif',"important")},setActionLabelContent:function(t){n.currentActionName!==t&&(this.actionLabel.textContent=r.actionI18nString[t])}},t={checkIfElementExists:function(n){return document.body.contains(n)},removeElement:function(n){this.checkIfElementExists(n)&&(document.body.removeChild(n),n=null)},sendActionResultToBackground:function(n){this.sendMessageToBackground({action:"Save Action Result",actionResult:n})},sendMessageToBackground:function(n){chrome.runtime.sendMessage({action:n.action,url:n.url,actionResult:n.actionResult},function(){})}};document.addEventListener("DOMContentLoaded",function(){r.initMSBrowser();f.initUserSetting()},!1)})()