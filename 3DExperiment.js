// Description: This file contains the 3D experiment logic for the virtual lab.
// Jongsoo Ha and Lorenzo Orio (2024)

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// -----------------------------------------------set up the 3D environment-----------------------------------------------
// === Scene, Camera, and Renderer Setup ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  65, // Field of view
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near clipping plane
  1000 // Far clipping plane
);
camera.position.set(0, 1.5, 1.5); // Adjusted camera position
camera.lookAt(0, 1, 0); // Ensure the camera points at the origin

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor("#bfbfbf"); // Background color
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";
document.body.appendChild(renderer.domElement);

// OrbitControls for camera interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Directional lighting for the scene
const light = new THREE.DirectionalLight(0xffffff, 4);
light.position.set(5, 10, 7.5);
scene.add(light);

// === Raycaster, Mouse, Hover, and Click ===
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const selectableObjects = []; // Objects that can be hovered or clicked
let previouslyHoveredObject = null; // Track the last hovered object

// === Highlight on Hover ===
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(selectableObjects, true);

  if (intersects.length > 0) {
    const hoveredObject = intersects[0].object.parent; // Get the parent group of the object
    if (hoveredObject !== previouslyHoveredObject) {
      // Reset the highlight on the previously hovered object
      if (previouslyHoveredObject) {
        previouslyHoveredObject.traverse((child) => {
          if (child.isMesh) {
            child.material.emissive.setHex(
              child.userData.originalEmissiveHex || 0x000000
            ); // Reset emissive color
          }
        });
      }

      // Highlight the new object
      hoveredObject.traverse((child) => {
        if (child.isMesh) {
          if (!child.userData.originalEmissiveHex) {
            child.userData.originalEmissiveHex =
              child.material.emissive.getHex(); // Store original emissive color
          }
          child.material.emissive.setHex(0xff0000); // Set highlight color
        }
      });

      previouslyHoveredObject = hoveredObject; // Update the previously hovered object
    }
  } else if (previouslyHoveredObject) {
    // Reset the highlight when nothing is hovered
    previouslyHoveredObject.traverse((child) => {
      if (child.isMesh) {
        child.material.emissive.setHex(
          child.userData.originalEmissiveHex || 0x000000
        ); // Reset emissive color
      }
    });
    previouslyHoveredObject = null; // Clear the previously hovered object
  }
});

// -----------------------------------------------End of set up----------------------------------------------


// === After Clicking Each Step Object ===
// they are used to store the 3D models
let glove1, glove2, finalResult, petriDish, flintStriker, toothpick;


// === Add Click Feature to Trigger Next Step ===
export function startExperiment(triggerNextStep) {
  // Add event listener for clicks
  window.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(selectableObjects, true);
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object.parent; // Get the parent group of the clicked object
      const parentObject = clickedObject.parent; // Get the parent group of the clicked object

      console.log(`Clicked on: ${clickedObject.name || "Unnamed Object"}`);

      // Trigger the next step based on the clicked object's name
      switch (true) {
        case clickedObject.name === "Cube_0": // aka the gloves
          console.log("Glove clicked!");
          // Remove the gloves from
          glove1.visible = false;
          glove2.visible = false;
          triggerNextStep("step1"); // Trigger the next step for Petri Dish
          break;
        case parentObject.name === "Flint Striker": // Add a condition for step3
          console.log("Flint Striker clicked!");
          flintStriker.visible = false;
          triggerNextStep("step2");
          break;
        case parentObject.name === "Toothpick":
          console.log("Toothpick clicked!");
          toothpick.visible = false;
          
          triggerNextStep("step3"); // Trigger step3 completion
          break;  
        case clickedObject.name === "Circle001": // This is the toothpick
          console.log("Petri Dish clicked!");
          toothpick.visible = false;
          if (finalResult) {
            finalResult.visible = true;
          }
          triggerNextStep("step4"); // Trigger step4 completion
          break;
        default:
          console.log("Object not mapped to a step.");
      }
    }
  });
}

// Add a grid helper to the scene
const gridHelper = new THREE.GridHelper(40, 400); // Size of the grid and number of divisions
gridHelper.position.set(0, -0.5, 0); // Ensure it's centered at the origin
scene.add(gridHelper);

/**
 * Function: onStepComplete
 * Handles logic when a step is completed in the 3D environment.
 * @param {string} flag - The identifier of the completed step.
 */
export function onStepComplete(flag) {
  // Perform 3D logic based on the completed step
  switch (flag) {
    case "step1":
      console.log("Step 1 Instruction: Click Gloves.");
      break;
    case "step2":
      console.log("Step 2 Instruction: click Flint Striker.");
      if (flintStriker) {
        flintStriker.visible = true;
      }
      break;
    case "step3":
      console.log("Step 3 Instruction: Click toothpick.");
      if(toothpick){
        toothpick.visible = true;
      }
      break;
    case "step4":
      console.log("Step 4 Instruction: click Petri Dish.");
      if (petriDish) {
        petriDish.visible = true;
      }
      break;
    case "complete":
      // if (finalResult) {
      //   finalResult.visible = true;
      // }
      break;  
    default:
      console.warn(`No specific logic defined for flag: ${flag}`);
  }
}


// ---------------------------------------------- Load 3D Models ----------------------------------------------


// === Load Models Dynamically ===
const loader = new GLTFLoader();

// Load the lab bench
loader.load("./models/lab_bench.glb", (gltf) => {
  const table = gltf.scene;
  table.position.set(0, 0, 0); // Position the table at the origin
  table.name = "Lab Bench";
  scene.add(table);
});

// Load the petri dish
loader.load("./models/petridish_and_loop.glb", (gltf) => {
  petriDish = gltf.scene;
  petriDish.position.set(0.95, 0.53, -0.15); // Adjust position if necessary
  petriDish.scale.set(0.8, 0.8, 0.8);
  petriDish.name = "Petri Dish";
  petriDish.visible = false; // Hide it initially

  // Traverse and ensure child objects also have proper names
  petriDish.traverse((child) => {
    if (child.isMesh) {
      child.name = "PetriDishMesh"; // Name individual meshes for debugging
      child.material = child.material.clone(); // Clone material to avoid sharing
      selectableObjects.push(child); // Make it selectable
    }
  });

  scene.add(petriDish);
});

// Load the flint striker
loader.load("./models/flint_striker.glb", (gltf) => {
  flintStriker = gltf.scene;
  flintStriker.name = "Flint Striker";
  flintStriker.position.set(0, 0.1, 0.15); 
  flintStriker.scale.set(0.8, 0.8, 0.8); 
  flintStriker.visible = false; // Hide it initially

  // Add meshes to selectable objects for interaction
  flintStriker.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone(); // Clone material to avoid sharing
      selectableObjects.push(child); // Make it selectable
    }
  });

  scene.add(flintStriker);
});

// Load the toothpick
loader.load("./models/toothpick.glb", (gltf) => {
  toothpick = gltf.scene;
  toothpick.name = "Toothpick"; // Assign a name for identification
  toothpick.visible = false; // Hide it initially


  // Traverse and ensure child objects also have proper names
  toothpick.traverse((child) => {
    if (child.isMesh) {
      child.name = "ToothpickMesh"; // Name individual meshes for debugging
      child.material = child.material.clone(); // Clone material to avoid sharing
      selectableObjects.push(child); // Make it selectable
    }
  });

  scene.add(toothpick); // Add the model to the scene
});

// Load the final result
loader.load("./models/final_result.glb", (gltf) => {
  finalResult = gltf.scene;
  finalResult.name = "Final Result"; // Assign a name for identification
  finalResult.visible = false; // Hide it initially


  // Traverse and add its meshes to selectable objects for interaction
  finalResult.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone(); // Clone material to avoid sharing
      selectableObjects.push(child); // Make it selectable
    }
  });

  scene.add(finalResult); // Add the model to the scene
});

// Load gloves
loader.load("./models/glove.glb", (gltf) => {
  glove1 = gltf.scene;
  glove2 = gltf.scene.clone(); // Clone to create another glove

  glove1.position.set(-1.1, 0.57, 0.2);
  glove2.position.set(-0.9, 0.57, 0.2);
  glove1.scale.set(0.08, 0.08, 0.08);
  glove2.scale.set(0.08, 0.08, 0.08);
  glove1.rotation.y = -Math.PI / 3;
  glove2.rotation.y = -Math.PI / 2;
  glove1.name = "Glove 1";
  glove2.name = "Glove 2";

  // Add both gloves to selectable objects
  [glove1, glove2].forEach((glove) => {
    glove.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        selectableObjects.push(child);
      }
    });
    scene.add(glove);
  });
});

// === Handle Window Resize ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Animation Loop ===
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
