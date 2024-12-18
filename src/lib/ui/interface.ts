import { Scene } from '@babylonjs/core'

const createSlider = ({ initialValue }: any) => {
  let slider = document.createElement('input')
  slider.id = 'rangeSlider'
  slider.type = 'range'
  slider.min = '0'
  slider.max = '1'
  slider.value = initialValue
  slider.step = '.1'
  slider.style.width = '100%'

  return slider // Return the created slider div
}

const createButton = (buttonProps: any) => {
  let button = document.createElement('button')
  button.textContent = buttonProps?.textContent
  button.style.backgroundColor = buttonProps?.backgroundColor || 'rgba(255, 255, 255)' // Button background
  button.style.color = buttonProps?.color || 'black' // Text color
  button.style.padding = buttonProps?.padding || '10px 20px' // Padding for the button
  button.style.border = buttonProps?.border || 'none' // Remove border
  button.style.borderRadius = '5px' // Rounded corners
  button.style.cursor = 'pointer'

  return button
}

function updateSliderForMaterial(scene: Scene, slider: HTMLInputElement, materialId: any, materialsUniformsData: any) {
  let selectedMaterial = scene?.materials?.find((material) => material?.id === materialId)

  if (selectedMaterial) {
    slider.value = `${materialsUniformsData[selectedMaterial?.id]['alpha']}`
  }
}

const createInterface = (scene: Scene, materialsUniformsData: any, engine: any) => {
  let button = document.createElement('button')
  let fullscreen = createButton({textContent: 'Full Screen'})
  let enableDebug = createButton({textContent: 'Disable Debug'})

  button.textContent = 'Material Interface' // Button text
  button.style.position = 'absolute' // Position it over the canvas
  button.style.top = '20px' // Adjust as needed
  button.style.right = '20px' // Adjust as needed
  button.style.zIndex = '10' // Ensure it's above the canvas
  button.style.backgroundColor = 'rgba(0, 0, 0, 0.5)' // Button background
  button.style.color = 'white' // Text color
  button.style.padding = '10px 20px' // Padding for the button
  button.style.border = 'none' // Remove border
  button.style.borderRadius = '5px' // Rounded corners
  button.style.cursor = 'pointer' // Pointer cursor on hover

  let slideInDiv = document.createElement('div')
  slideInDiv.id = 'slideInDiv' // Set an ID for styling
  slideInDiv.style.padding = '0px 12px 12px 12px'
  slideInDiv.style.display = 'flex'
  slideInDiv.style.flexDirection = 'column'
  slideInDiv.style.rowGap = '8px'
  slideInDiv.classList.add('slide-out')

  // Optional: Add content to the div
  slideInDiv.innerHTML = '<h2>Material Interface</h2>'

  button.addEventListener('click', function () {
    if (slideInDiv.classList.contains('slide-in')) {
      slideInDiv.classList.remove('slide-in')
      slideInDiv.classList.add('slide-out')
    } else {
      // If the div is hidden, slide it in
      slideInDiv.classList.remove('slide-out')
      slideInDiv.classList.add('slide-in')
    }
  })

  // Label for Dropdown
  let label = document.createElement('label')
  label.setAttribute('for', 'dropdown') // Link the label to the dropdown by ID
  label.textContent = 'Choose Material:'

  let select = document.createElement('select') // Create select element
  select.id = 'dropdown' // Set an ID for the dropdown

  let title = document.createElement('h3')
  title.textContent = 'Choose Material'

  // Create options for the dropdown
  scene?.materials?.forEach((material) => {
    let option = document.createElement('option')
    option.value = material?.id
    option.textContent = material.name || material.id
    select.appendChild(option)
  })

  let labelInput = document.createElement('label')
  labelInput.setAttribute('for', 'userInput') // Link the label to the input by ID
  labelInput.textContent = 'Alpha:' // Set the label text

  // Step 6: Create the input field dynamically
  let sliderDiv = createSlider('')

  sliderDiv.addEventListener('input', () => {
    let selectedMaterialId = select?.value
    let selectedMaterial: any = scene?.materials?.find((material) => material?.id === selectedMaterialId)
    selectedMaterial?.setFloat('alpha', sliderDiv?.value)
  })

  select.addEventListener('change', () => {
    updateSliderForMaterial(scene, sliderDiv, select?.value, materialsUniformsData)
  })

  fullscreen.addEventListener('click', function () {
    if (engine) {
      engine.switchFullscreen(true)
    }
  })

  enableDebug.addEventListener('click', function () {
    if (scene) {
      if (scene?.debugLayer?.isVisible()) {
        scene?.debugLayer?.hide()
        enableDebug.textContent = 'Enable Debug'
      } else {
        scene?.debugLayer?.show({ showExplorer: true, embedMode: true })
        enableDebug.textContent = 'Disable Debug'
      }
    }
  })
  // Append the select (dropdown) to the slide-in div
  slideInDiv.appendChild(label)
  slideInDiv.appendChild(select)
  slideInDiv.appendChild(labelInput) // Append the input label
  slideInDiv.appendChild(sliderDiv) // Append the input field
  slideInDiv.appendChild(fullscreen) // 
  slideInDiv.appendChild(enableDebug)

  // Step 4: Append the div to the body
  document.body.appendChild(slideInDiv)
  document.body.appendChild(button)
}

export default createInterface


// Tasks for today 
/**
 * 
 * Add all the possible values to the ui
 * improve the code 
 * refactor the code 
 */