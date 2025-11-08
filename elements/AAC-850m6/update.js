function(instance, properties, context) {
  // Generate unique instance ID
  let instanceId = (Math.random() * Math.pow(2, 54)).toString(36);
  instance.data.instanceName = 'testimonialSlider-' + instanceId;

  // Get properties
  const testimonialsData = properties.testimonials_json || null;
  let scrollSpeedInput = properties.scroll_speed || 3; // 1-10 scale
  // Validate speed is within 1-10 range, default to 3 if invalid
  if (scrollSpeedInput < 1 || scrollSpeedInput > 10) {
    scrollSpeedInput = 3;
  }
  // Convert 1-10 scale to animation duration: 1 = slowest (200s), 5 = medium (100s), 10 = fastest (10s)
  const scrollSpeed = 210 - (scrollSpeedInput * 20);
  const cardHeight = properties.card_height || 200;
  const backgroundColor = properties.background_color || '#1a1a1a';
  const colorName = properties.color_name || '#ffffff';
  const colorTitle = properties.color_title || '#999999';
  const colorReview = properties.color_review || '#cccccc';
  const scrollDirection = properties.scroll_direction || 'Left';
  const roundness = properties.roundness !== undefined && properties.roundness !== null ? properties.roundness : 12;
  const stopOnHover = properties.stop_on_hover !== false; // Default to true
  
  // Field name mappings - allows flexible key names
  const avatarField = properties.avatar_field || 'avatar';
  const nameField = properties.name_field || 'name';
  const titleField = properties.title_field || 'title';
  const reviewField = properties.review_field || 'review';

  // Helper function to fix avatar URLs that start with //
  function fixAvatarUrl(url) {
    if (!url) return 'https://avatar.iran.liara.run/public';
    
    // If URL starts with //, add https:
    if (url.startsWith('//')) {
      return 'https:' + url;
    }
    
    return url;
  }

  // Parse and validate testimonials data
  let testimonials = [];
  
  if (testimonialsData) {
    try {
      let parsedData = testimonialsData;
      
      // Handle string input
      if (typeof testimonialsData === 'string') {
        let cleanedJson = testimonialsData.trim();
        
        if (cleanedJson) {
          // Remove any BOM or hidden characters at the start
          cleanedJson = cleanedJson.replace(/^\uFEFF/, '');
          
          // Fix the malformed JSON with a smarter approach
          // The issue: Bubble converts smart quotes to regular quotes, causing patterns like: "review": ""Text"
          // This makes the parser think the string ends after the first quote
          
          let result = '';
          let i = 0;
          
          while (i < cleanedJson.length) {
            // Look for the pattern: ": " followed by quote
            if (i < cleanedJson.length - 3 && 
                cleanedJson[i] === ':' && 
                cleanedJson[i + 1] === ' ' && 
                cleanedJson[i + 2] === '"') {
              
              // Found start of a string value
              result += ': "';
              i += 3;
              
              // Now collect the string content until we find the END quote
              // The end quote is followed by either , or } or ]
              let stringContent = '';
              let foundEnd = false;
              
              while (i < cleanedJson.length && !foundEnd) {
                const char = cleanedJson[i];
                const nextChar = i + 1 < cleanedJson.length ? cleanedJson[i + 1] : '';
                
                // Check if this might be the closing quote
                // Look ahead past any whitespace to find the next meaningful character
                if (char === '"') {
                  let lookAhead = i + 1;
                  while (lookAhead < cleanedJson.length && 
                         (cleanedJson[lookAhead] === '\n' || 
                          cleanedJson[lookAhead] === '\r' || 
                          cleanedJson[lookAhead] === ' ' || 
                          cleanedJson[lookAhead] === '\t')) {
                    lookAhead++;
                  }
                  
                  const nextMeaningful = lookAhead < cleanedJson.length ? cleanedJson[lookAhead] : '';
                  
                  // If the next meaningful char is a delimiter, this is the closing quote
                  if (nextMeaningful === ',' || nextMeaningful === '}' || nextMeaningful === ']') {
                    foundEnd = true;
                    result += stringContent + '"';
                    i++;
                  } else {
                    // This quote is part of the content - escape it
                    stringContent += '\\"';
                    i++;
                  }
                } else {
                  // This is content - escape special characters
                  if (char === '\n') {
                    stringContent += '\\n';
                  } else if (char === '\r') {
                    // Skip
                  } else if (char === '\t') {
                    stringContent += ' ';
                  } else if (char === '"') {
                    // Quote inside the string - escape it
                    stringContent += '\\"';
                  } else if (char === '\\' && nextChar === '"') {
                    // Already escaped quote - keep it
                    stringContent += '\\"';
                    i++; // Skip the next quote
                  } else if (char === '\\') {
                    stringContent += '\\\\';
                  } else {
                    stringContent += char;
                  }
                  i++;
                }
              }
            } else {
              // Not a string value start - copy as-is (but clean whitespace)
              if (cleanedJson[i] === '\n' || cleanedJson[i] === '\r') {
                // Keep structural newlines outside strings
                if (cleanedJson[i] === '\n') {
                  result += '\n';
                }
              } else {
                result += cleanedJson[i];
              }
              i++;
            }
          }
          
          cleanedJson = result;
          
          // Try parsing with standard JSON.parse first
          try {
            parsedData = JSON.parse(cleanedJson);
          } catch (jsonError) {
            // If JSON.parse fails, try using eval as a fallback (safer than failing completely)
            try {
              parsedData = eval('(' + cleanedJson + ')');
            } catch (evalError) {
              // If both fail, throw the original JSON error
              throw jsonError;
            }
          }
        }
      }
      
      // Handle Bubble's list format - if it's an object with get/length methods
      if (parsedData && typeof parsedData.length === 'function' && typeof parsedData.get === 'function') {
        const length = parsedData.length();
        const items = [];
        for (let i = 0; i < length; i++) {
          const item = parsedData.get(i);
          if (item && typeof item.get === 'function') {
            items.push({
              avatar: item.get(avatarField) || item.get(avatarField.charAt(0).toUpperCase() + avatarField.slice(1)) || '',
              name: item.get(nameField) || item.get(nameField.charAt(0).toUpperCase() + nameField.slice(1)) || '',
              title: item.get(titleField) || item.get(titleField.charAt(0).toUpperCase() + titleField.slice(1)) || '',
              review: item.get(reviewField) || item.get(reviewField.charAt(0).toUpperCase() + reviewField.slice(1)) || ''
            });
          }
        }
        parsedData = items;
      }
      
      // Validate that it's an array
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        // Sanitize and validate each testimonial using dynamic field names
        testimonials = parsedData.map(item => ({
          avatar: fixAvatarUrl(item[avatarField] || ''),
          name: String(item[nameField] || '').trim(),
          title: String(item[titleField] || '').trim(),
          review: String(item[reviewField] || '').trim()
        })).filter(item => item.name || item.review);
      }
    } catch (e) {
      // Silent fail - don't log errors in production
    }
  }
  
  // If no valid testimonials, don't render anything
  if (testimonials.length === 0) {
    instance.canvas.empty();
    const emptyMessage = document.createElement('div');
    emptyMessage.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;color:#999;font-family:inherit;';
    emptyMessage.textContent = 'Add testimonials data to display';
    instance.canvas.append(emptyMessage);
    return;
  }

  // Clear canvas
  instance.canvas.empty();

  // Create container
  const container = document.createElement('div');
  container.className = `testimonial-slider-container-${instanceId}`;

  // Create slider wrapper
  const sliderWrapper = document.createElement('div');
  sliderWrapper.className = `testimonial-slider-wrapper-${instanceId}`;

  // Create slider track
  const sliderTrack = document.createElement('div');
  sliderTrack.className = `testimonial-slider-track-${instanceId}`;

  // Function to create testimonial card
  function createTestimonialCard(testimonial) {
    const card = document.createElement('div');
    card.className = `testimonial-card-${instanceId}`;

    // Top section with avatar and name/title
    const headerSection = document.createElement('div');
    headerSection.className = `testimonial-header-${instanceId}`;

    const avatar = document.createElement('img');
    avatar.src = fixAvatarUrl(testimonial.avatar);
    avatar.alt = testimonial.name || 'Avatar';
    avatar.className = `testimonial-avatar-${instanceId}`;

    const headerContent = document.createElement('div');
    headerContent.className = `testimonial-header-content-${instanceId}`;

    const name = document.createElement('div');
    name.className = `testimonial-name-${instanceId}`;
    name.textContent = testimonial.name || '';

    const title = document.createElement('div');
    title.className = `testimonial-title-${instanceId}`;
    title.textContent = testimonial.title || '';

    headerContent.appendChild(name);
    headerContent.appendChild(title);

    headerSection.appendChild(avatar);
    headerSection.appendChild(headerContent);

    // Review section (full width)
    const review = document.createElement('div');
    review.className = `testimonial-review-${instanceId}`;
    // Convert \n to <br> tags for proper line break display
    const reviewText = (testimonial.review || '').replace(/\n/g, '<br>');
    review.innerHTML = reviewText;

    card.appendChild(headerSection);
    card.appendChild(review);

    // Calculate optimal line clamp after card is added to DOM
    setTimeout(() => {
      const reviewHeight = review.offsetHeight;
      const lineHeight = parseFloat(getComputedStyle(review).lineHeight);
      const maxLines = Math.floor(reviewHeight / lineHeight);
      
      if (maxLines > 0) {
        review.style.webkitLineClamp = maxLines.toString();
      }
    }, 0);

    return card;
  }

  // Duplicate testimonials for infinite loop effect
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  // Add all testimonial cards to track
  duplicatedTestimonials.forEach(testimonial => {
    const card = createTestimonialCard(testimonial);
    sliderTrack.appendChild(card);
  });

  // Append elements
  sliderWrapper.appendChild(sliderTrack);
  container.appendChild(sliderWrapper);

  // Styles reference: See style.css for complete styling template
  // Dynamic properties are injected below with instance-specific values
  const style = document.createElement('style');
  const animationName = scrollDirection === 'Right' ? `scroll-${instanceId}-reverse` : `scroll-${instanceId}`;
  
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Satoshi:wght@300;400;500;600;700;800;900&display=swap');
    .testimonial-slider-container-${instanceId}{width:100%;height:100%;overflow:hidden;position:relative;font-family:'Satoshi',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;color:inherit;background-color:transparent;padding:0;margin:0}
    .testimonial-slider-wrapper-${instanceId}{width:100%;height:100%;overflow:hidden;position:relative}
    .testimonial-slider-track-${instanceId}{display:flex;gap:16px;position:absolute;left:0;top:50%;transform:translateY(-50%);will-change:transform;transition:animation-play-state .3s ease}
    .testimonial-card-${instanceId}{width:320px;min-width:320px;height:${cardHeight}px;background:${backgroundColor};border-radius:${roundness}px;padding:20px;display:flex;flex-direction:column;gap:12px;box-sizing:border-box;flex-shrink:0}
    .testimonial-header-${instanceId}{display:flex;flex-direction:row;gap:12px;align-items:center;flex-shrink:0}
    .testimonial-avatar-${instanceId}{width:50px;height:50px;border-radius:50%;object-fit:cover;flex-shrink:0}
    .testimonial-header-content-${instanceId}{display:flex;flex-direction:column;gap:2px;flex:1;overflow:hidden;min-width:0}
    .testimonial-name-${instanceId}{font-size:16px;font-weight:600;color:${colorName};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .testimonial-title-${instanceId}{font-size:14px;color:${colorTitle};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .testimonial-review-${instanceId}{font-size:14px;color:${colorReview};line-height:1.5;overflow:hidden;text-overflow:ellipsis;width:100%;box-sizing:border-box;flex:1;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:unset;word-break:break-word}
    @keyframes scroll-${instanceId}{0%{transform:translateX(0) translateY(-50%)}100%{transform:translateX(calc(-336px * ${testimonials.length})) translateY(-50%)}}
    @keyframes scroll-${instanceId}-reverse{0%{transform:translateX(calc(-336px * ${testimonials.length})) translateY(-50%)}100%{transform:translateX(0) translateY(-50%)}}
    .testimonial-slider-track-${instanceId}.animating{animation:${animationName} ${scrollSpeed}s linear infinite}
    .testimonial-slider-track-${instanceId}.paused{animation-play-state:paused}
  `;

  container.appendChild(style);

  // Append to canvas
  instance.canvas.append(container);

  // Start animation after a brief delay
  setTimeout(() => {
    sliderTrack.classList.add('animating');
  }, 100);

  // Conditionally add pause on hover/touch functionality
  if (stopOnHover) {
    // Desktop: Pause on hover
    container.addEventListener('mouseenter', () => {
      sliderTrack.classList.add('paused');
    });

    // Desktop: Resume on mouse leave
    container.addEventListener('mouseleave', () => {
      sliderTrack.classList.remove('paused');
    });

    // Mobile: Pause on touch start
    container.addEventListener('touchstart', () => {
      sliderTrack.classList.add('paused');
    }, { passive: true });

    // Mobile: Resume on touch end
    container.addEventListener('touchend', () => {
      sliderTrack.classList.remove('paused');
    }, { passive: true });
  }
}

