import DebugDrawer from "./debug-drawer.js";
import { b2AABB } from "@box2d/core";
import { b2BodyType } from "@box2d/core";
import { b2CircleShape } from "@box2d/core";
import { b2PolygonShape } from "@box2d/core";
import { b2World } from "@box2d/core";
import { DrawAABBs } from "@box2d/core";
import { DrawShapes } from "@box2d/core";

const canvas = document.getElementById("renderCanvas");
const ctx = canvas.getContext("2d");

let world, debugDrawer;
const pixelsPerMeter = 30;
let lastTime, currentTime, dt;

function getBodyCallback(fixture) {
    const userData = fixture.GetUserData();
    if (userData) {
        console.log(userData.name);
    }
}

canvas.onmousedown = (e) => {
    const mouseX = (e.clientX - canvas.offsetLeft) / pixelsPerMeter;
    const mouseY = (e.clientY - canvas.offsetTop) / pixelsPerMeter;

    const aabb = new b2AABB();
    aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
    aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);
    world.QueryAABB(aabb, getBodyCallback);
}

function draw(renderer) {
    currentTime = Date.now();
    dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    world.Step(dt, { velocityIterations: 3, positionIterations: 2 });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fill();
    DrawShapes(debugDrawer, world);
    DrawAABBs(debugDrawer, world);

    requestAnimationFrame(draw);
}

function init() {
    world = b2World.Create({ x: 0, y: 9.8 });
    debugDrawer = new DebugDrawer(ctx, pixelsPerMeter);

    // Ground
    const groundShape = new b2PolygonShape();
    groundShape.SetAsBox(130 / pixelsPerMeter, 20 / pixelsPerMeter);
    const groundBody = world.CreateBody({
        type: b2BodyType.b2_staticBody,
        position: { x: 150 / pixelsPerMeter, y: 270 / pixelsPerMeter }
    });
    const groundFixture = groundBody.CreateFixture({ shape: groundShape });
    groundFixture.SetUserData({ name: "ground" });

    // Box
    const boxShape = new b2PolygonShape();
    boxShape.SetAsBox(30 / pixelsPerMeter, 30 / pixelsPerMeter);
    const boxBody = world.CreateBody({
        type: b2BodyType.b2_dynamicBody,
        position: { x: 100 / pixelsPerMeter, y: 30 / pixelsPerMeter },
        angle: 30 * Math.PI / 180
    });
    const boxFixture = boxBody.CreateFixture({ shape: boxShape, density: 1 });
    boxFixture.SetUserData({ name: "box" });

    // Circle
    const circleShape = new b2CircleShape(20 / pixelsPerMeter);
    const circleBody = world.CreateBody({
        type: b2BodyType.b2_dynamicBody,
        position: { x: 200 / pixelsPerMeter, y: 50 / pixelsPerMeter }
    });
    const circleFixture = circleBody.CreateFixture({ shape: circleShape, density: 1 });
    circleFixture.SetRestitution(0.5);
    circleFixture.SetUserData({ name: "circle" });

    // Platform
    const platformShape = new b2PolygonShape();
    platformShape.SetAsBox(50 / pixelsPerMeter, 5 / pixelsPerMeter);
    const platformBody = world.CreateBody({
        type: b2BodyType.b2_staticBody,
        position: { x: 220 / pixelsPerMeter, y: 200 / pixelsPerMeter },
        angle: -20 * Math.PI / 180
    });
    const platformFixture = platformBody.CreateFixture({ shape: platformShape });
    platformFixture.SetUserData({ name: "platform" });

    lastTime = Date.now();
    draw();
}

init();
