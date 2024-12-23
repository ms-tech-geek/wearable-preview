import { Scene } from '@babylonjs/core'

const createLabel = (labelText: string) => {
  const label = document.createElement('label') // Create the label
  label.textContent = labelText // Set the label text
  label.setAttribute('for', labelText.toLowerCase().replace(/\s+/g, '-') + '-input') // Set 'for' attribute to match the input ID
  return label
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

const createCheckbox = ({ initialChecked }: { initialChecked: boolean }) => {
  let checkbox = document.createElement('input') // Create the checkbox
  checkbox.type = 'checkbox' // Set the type to checkbox
  checkbox.checked = initialChecked // Set the initial state of the checkbox
  checkbox.id = 'alphaCheckbox' // Set the ID for the checkbox
  checkbox.style.marginRight = '10px' // Add some margin for spacing

  let label = document.createElement('label')
  label.setAttribute('for', checkbox.id)
  label.textContent = 'Enable Alpha Adjust'

  document.body.appendChild(checkbox)
  document.body.appendChild(label)

  return checkbox
}

const createSelectComponent = (
  optionsList: any[], // List of options (can be any array of objects)
  valueKey: string, // The key in the object to use as the value of the option
  textKey: string, // The key in the object to use as the text content of the option
  selectId: string // The ID of the select element
) => {
  const select = document.createElement('select')
  select.id = selectId

  optionsList.forEach((optionItem) => {
    const option = document.createElement('option')
    option.value = optionItem[valueKey]
    option.textContent = optionItem[textKey] || optionItem[valueKey]
    select.appendChild(option)
  })

  return select
}

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

const createSliderWithNumberInput = ({ initialValue }: any) => {
  // Create a container for the slider and the number input
  const container = document.createElement('div')
  container.style.display = 'flex'
  container.style.alignItems = 'center'
  container.style.width = '100%'

  // Create the slider element
  const slider = document.createElement('input')
  slider.type = 'range'
  slider.id = 'rangeSlider'
  slider.min = '0'
  slider.max = '1'
  slider.value = initialValue
  slider.step = '.1'
  slider.style.flex = '1' // Make the slider take the remaining width in the container

  // Create the number input element
  const numberInput = document.createElement('input')
  numberInput.type = 'number'
  numberInput.id = 'numberInput'
  numberInput.value = initialValue
  numberInput.min = '0'
  numberInput.max = '1'
  numberInput.step = '.1'
  numberInput.style.width = '70px' // Set a fixed width for the number input box
  numberInput.style.marginLeft = '10px' // Space between slider and number input box

  // Update the number input value when the slider is changed
  slider.addEventListener('input', () => {
    numberInput.value = slider.value
  })

  // Update the slider value when the number input is changed
  numberInput.addEventListener('input', () => {
    slider.value = numberInput.value
  })

  // Append the slider and number input to the container
  container.appendChild(slider)
  container.appendChild(numberInput)

  return container // Return the container with the slider and number input
}

const createNumberInput = ({
  initialValue,
  id,
  min = 0,
  max = 1,
  step = 0.1,
}: {
  initialValue: number
  id: string
  min?: number
  max?: number
  step?: number
}) => {
  const input = document.createElement('input') // Create the number input
  input.type = 'number' // Set input type to number
  input.value = initialValue.toString() // Set the initial value
  input.id = id // Set the input ID
  if (min !== undefined) input.min = min.toString() // Set minimum value if provided
  if (max !== undefined) input.max = max.toString() // Set maximum value if provided
  if (step !== undefined) input.step = step.toString() // Set step value if provided
  return input
}

const createLabelWithNumberInput = ({ labelText, initialValue }: any) => {
  // Create a container to hold the label and the number input
  const container = document.createElement('div')
  container.style.display = 'flex'
  container.style.alignItems = 'center'
  container.style.width = '100%'

  // Create the label element
  const label = document.createElement('label')
  label.textContent = labelText // Set the label text
  label.style.marginRight = '10px' // Space between label and input

  // Create the number input element
  const numberInput = document.createElement('input')
  numberInput.type = 'number'
  numberInput.value = initialValue
  numberInput.min = '0'
  numberInput.max = '100' // Set a default max value
  numberInput.step = '1' // Set the step value
  numberInput.style.width = '80px' // Set width for the number input
  numberInput.style.padding = '5px' // Add padding for better user experience

  // Append the label and number input to the container
  container.appendChild(label)
  container.appendChild(numberInput)

  return container // Return the container with label and number input
}

const createImageFileInput = ({ id, accept }: { id: string; accept: string }) => {
  const input = document.createElement('input') // Create the input element
  input.type = 'file' // Set the type to file
  input.id = id // Set the ID for the input element
  input.accept = accept // Restrict file types (e.g., images only)
  return input
}

const createLabelWithImageInputBox = ({ labelText }: any) => {
  // Create a container to hold the label and the image input
  const container = document.createElement('div')
  container.style.display = 'flex'
  container.style.flexDirection = 'column' // Stack label and input vertically
  container.style.alignItems = 'flex-start'
  container.style.width = '100%'

  // Create the label element
  const label = document.createElement('label')
  label.textContent = labelText // Set the label text
  label.style.marginBottom = '5px' // Space between label and input

  // Create the file input element (for image upload)
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/*' // Restrict to image files only
  fileInput.style.marginBottom = '10px' // Space between input and preview

  // Create an image element for preview
  const imagePreview = document.createElement('img')
  imagePreview.style.maxWidth = '100px' // Limit image preview size
  imagePreview.style.marginTop = '10px' // Space above the image preview
  imagePreview.style.display = 'none' // Initially hidden until an image is selected

  // Add an event listener to handle image file input and show the preview
  fileInput.addEventListener('change', (event: any) => {
    const file = event?.target?.files?.[0]
    if (file && file.type.startsWith('image/')) {
      // Create a URL for the selected image and set it as the src of the preview
      const imageUrl = URL.createObjectURL(file)
      imagePreview.src = imageUrl
      imagePreview.style.display = 'block' // Show the image preview
    } else {
      // If the file is not an image, hide the preview
      imagePreview.style.display = 'none'
    }
  })

  // Append the label, file input, and image preview to the container
  container.appendChild(label)
  container.appendChild(fileInput)
  container.appendChild(imagePreview)

  return container // Return the container with the label, input, and image preview
}


function updateSliderForMaterial(scene: Scene, slider: HTMLInputElement, materialId: any, materialsUniformsData: any) {
  let selectedMaterial = scene?.materials?.find((material) => material?.id === materialId)

  if (selectedMaterial) {
    slider.value = `${materialsUniformsData[selectedMaterial?.id]['alpha']}`
  }
}

const createInterface = (scene: Scene, materialsUniformsData: any, engine: any) => {

  // components Initialisation
  let sliderDiv = createSlider('')
  let samplelabel = createLabel('Sample Label')
  let fullscreen = createButton({ textContent: 'Full Screen' })
  let enableDebug = createButton({ textContent: 'Disable Debug' })
  let sliderInput = createSliderWithNumberInput(5);
  let checkBox = createCheckbox({initialChecked: true});
  let inputNumber = createNumberInput({ initialValue: .5, id: 'static' })

  let button = document.createElement('button')

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

  let label = document.createElement('label')
  label.setAttribute('for', 'dropdown') // Link the label to the dropdown by ID
  label.textContent = 'Choose Material:'

  let select = document.createElement('select') // Create select element
  select.id = 'dropdown' // Set an ID for the dropdown

  let title = document.createElement('h3')
  title.textContent = 'Choose Material'

  scene?.materials?.forEach((material) => {
    let option = document.createElement('option')
    option.value = material?.id
    option.textContent = material.name || material.id
    select.appendChild(option)
  })

  let labelInput = createLabel('Alpha:')
  labelInput.setAttribute('for', 'userInput') // Link the label to the input by ID

  // Event Listeners 
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

  // Append Child to slideInDiv
  slideInDiv.appendChild(label)
  slideInDiv.appendChild(select)
  slideInDiv.appendChild(labelInput)
  slideInDiv.appendChild(sliderDiv) 
  slideInDiv.appendChild(fullscreen) 
  slideInDiv.appendChild(enableDebug)
  slideInDiv.appendChild(samplelabel)
  slideInDiv.appendChild(sliderInput)
  slideInDiv.appendChild(checkBox)
  slideInDiv.appendChild(inputNumber)

  // Append the slideInDiv to Body
  document.body.appendChild(slideInDiv)
  document.body.appendChild(button)
}

export default createInterface
