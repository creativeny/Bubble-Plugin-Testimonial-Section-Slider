function(instance, properties) {
  // Get properties with fallbacks
  const cardHeight = properties.card_height || 200;
  const backgroundColor = properties.background_color || '#1a1a1a';
  const colorName = properties.color_name || '#ffffff';
  const colorTitle = properties.color_title || '#999999';
  const colorReview = properties.color_review || '#cccccc';
  const roundness = properties.roundness || 12;

  // Preview HTML with single centered sample card
  const previewHTML = `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      overflow: hidden;
      margin: 0;
      padding: 0;
      font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    ">
      <div style="
        width: 320px;
        min-width: 320px;
        height: ${cardHeight}px;
        background: ${backgroundColor};
        border-radius: ${roundness}px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        box-sizing: border-box;
      ">
        <div style="
          display: flex;
          flex-direction: row;
          gap: 12px;
          align-items: flex-start;
        ">
          <img 
            src="https://avatar.iran.liara.run/public/29" 
            alt="Avatar"
            style="
              width: 50px;
              height: 50px;
              border-radius: 50%;
              object-fit: cover;
            "
          />
          <div style="
            display: flex;
            flex-direction: column;
            gap: 2px;
            flex: 1;
            overflow: hidden;
          ">
            <div style="
              font-size: 16px;
              font-weight: 600;
              color: ${colorName};
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            ">
              Sarah Anderson
            </div>
            <div style="
              font-size: 14px;
              color: ${colorTitle};
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            ">
              Product Designer
            </div>
          </div>
        </div>
        <div style="
          font-size: 14px;
          color: ${colorReview};
          line-height: 1.5;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          text-overflow: ellipsis;
        ">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
        </div>
      </div>
    </div>
  `;

  // Clear the instance canvas before appending
  $(instance.canvas).empty().append(previewHTML);
}