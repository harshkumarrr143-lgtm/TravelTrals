// TravelTales Itinerary PDF Generation Service
// Generates professional, multi-page travel itinerary PDFs with images, day schedules, and visitor tips
import { jsPDF } from 'jspdf';
import { travelData } from '../data/travelData.js';

/**
 * Loads an image from a URL and converts it to a base64 Data URL via HTML5 Canvas.
 * Safely handles CORS failures with fallback.
 */
async function getBase64ImageFromUrl(url) {
  if (!url) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const maxW = 400;
        let w = img.naturalWidth || img.width || 300;
        let h = img.naturalHeight || img.height || 200;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve({ dataUrl, width: w, height: h });
      } catch (e) {
        console.warn('Canvas toDataURL note for PDF:', e);
        resolve(null);
      }
    };
    img.onerror = () => {
      console.warn('Image load error for PDF:', url);
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * Main PDF Generator for Trip Planner Itinerary
 * @param {Object} plannerState - Current state of the trip planner
 * @param {Array} selectedAttractions - Array of attraction objects
 */
export async function downloadItineraryPdf(plannerState, selectedAttractions = null) {
  try {
    // If attractions not explicitly passed, map from plannerState IDs
    if (!selectedAttractions || selectedAttractions.length === 0) {
      selectedAttractions = (plannerState.selectedAttractionIds || [])
        .map(id => travelData.attractions.find(a => a.id === id))
        .filter(Boolean);
    }

    if (!selectedAttractions || selectedAttractions.length === 0) {
      throw new Error('No attractions selected to generate PDF.');
    }

    // Initialize jsPDF (A4 format: 210mm x 297mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);

    let currentY = 14;
    let pageNumber = 1;

    // Helper: Header bar for subsequent pages
    function drawPageHeader() {
      doc.setFillColor(15, 23, 42); // Navy 900
      doc.rect(margin, 10, contentWidth, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('TRAVELTALES — CURATED ITINERARY & VISITOR GUIDE', margin + 4, 15.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text('Agra • Mathura • Vrindavan', pageWidth - margin - 4, 15.5, { align: 'right' });
    }

    // Helper: Footer on all pages
    function drawPageFooter(pageNum, totalPages = '2') {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('TravelTales AI Travel Orchestrator • Official Tour Document', margin, pageHeight - 7);
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
    }

    // Helper: Check space and add page if needed
    function ensureSpace(neededHeight) {
      if (currentY + neededHeight > pageHeight - 18) {
        doc.addPage();
        pageNumber++;
        currentY = 24;
        drawPageHeader();
        return true;
      }
      return false;
    }

    // Preload all attraction images concurrently
    const imagePromises = selectedAttractions.map(att => getBase64ImageFromUrl(att.image));
    const loadedImages = await Promise.all(imagePromises);

    // Compute dates
    const startDate = plannerState.startDate || new Date().toISOString().split('T')[0];
    const parts = startDate.split('-');
    const startObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const endObj = new Date(startObj);
    endObj.setDate(startObj.getDate() + (plannerState.days - 1));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateRangeStr = `${startObj.getDate()} ${months[startObj.getMonth()]} ${startObj.getFullYear()} - ${endObj.getDate()} ${months[endObj.getMonth()]} ${endObj.getFullYear()}`;

    const hubLabels = {
      'taj-ganj': 'Taj Ganj & Heritage Zone, Agra',
      'agra-cantt': 'Agra Cantt Railway Gateway',
      'vrindavan-center': 'Vrindavan Sacred Center & Parikrama Marg',
      'mathura-junction': 'Holy Mathura & Yamuna Ghats'
    };
    const hubName = hubLabels[plannerState.startingPoint] || 'Heritage Gateway';

    // ════════════════════════════════════════════════════════════════
    // 1. COVER / HEADER HERO SECTION
    // ════════════════════════════════════════════════════════════════
    doc.setFillColor(13, 148, 136); // Teal 600 (#0D9488)
    doc.roundedRect(margin, currentY, contentWidth, 34, 3, 3, 'F');

    // Title & Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(204, 251, 241); // Teal 100
    doc.text('TRAVELTALES OFFICIAL ITINERARY • AI VERIFIED', margin + 6, currentY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(`${plannerState.days}-Day ${hubName.split(',')[0]} Circuit`, margin + 6, currentY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(240, 253, 250);
    doc.text(`Comprehensive Heritage, Temple & Culinary Journey across Agra, Mathura & Vrindavan`, margin + 6, currentY + 23);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(254, 243, 199); // Amber 100
    doc.text(`📅 ${dateRangeStr}  •  👥 ${plannerState.adults} Adults${plannerState.children ? `, ${plannerState.children} Children` : ''}  •  ⚡ Pacing: ${plannerState.pacing || 'Moderate'}`, margin + 6, currentY + 30);

    currentY += 38;

    // ════════════════════════════════════════════════════════════════
    // 2. TRIP SUMMARY METRICS BAR
    // ════════════════════════════════════════════════════════════════
    const colW = contentWidth / 4;
    const estTotal = (plannerState.days * 450) + (selectedAttractions.length * 150);
    const estPerPerson = Math.round(estTotal / (plannerState.adults + (plannerState.children || 0)));

    const summaryCards = [
      { label: 'Trip Duration', val: `${plannerState.days} ${plannerState.days === 1 ? 'Day' : 'Days'}` },
      { label: 'Selected Stops', val: `${selectedAttractions.length} Attractions` },
      { label: 'Est. Budget', val: `₹${estTotal.toLocaleString('en-IN')}` },
      { label: 'Est. Per Person', val: `₹${estPerPerson.toLocaleString('en-IN')}` }
    ];

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'FD');

    summaryCards.forEach((c, idx) => {
      const cx = margin + (idx * colW);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(c.label.toUpperCase(), cx + 4, currentY + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(c.val, cx + 4, currentY + 10.5);

      if (idx < 3) {
        doc.setDrawColor(226, 232, 240);
        doc.line(cx + colW, currentY + 2, cx + colW, currentY + 12);
      }
    });

    currentY += 18;

    // ════════════════════════════════════════════════════════════════
    // 3. DAY-BY-DAY ITINERARY WITH PHOTOS
    // ════════════════════════════════════════════════════════════════
    const daysCount = plannerState.days;
    const daySchedule = [];
    for (let i = 0; i < daysCount; i++) {
      daySchedule.push([]);
    }
    selectedAttractions.forEach((att, idx) => {
      daySchedule[idx % daysCount].push({ att, img: loadedImages[idx], globalIdx: idx });
    });

    const timeSlots = ['07:30 AM – 10:00 AM', '11:00 AM – 01:30 PM', '03:30 PM – 05:45 PM', '06:30 PM – 08:30 PM'];
    const foodPicks = [
      'Deviram Sweets: Bedai & Crispy Jalebi breakfast',
      'Panchi Petha Emporium: Kesar Angoori & Chocolate Petha',
      'Brijwasi Mithai Wala: Authentic Mathura Khoya Peda & Rabri Lassi',
      'Chhappan Bhog Vrindavan: Sacred temple prasadam feast'
    ];

    for (let d = 0; d < daysCount; d++) {
      const dayStops = daySchedule[d];
      if (dayStops.length === 0) continue;

      const dayDate = new Date(startObj);
      dayDate.setDate(startObj.getDate() + d);
      const dayDateStr = `${dayDate.getDate()} ${months[dayDate.getMonth()]} (${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dayDate.getDay()]})`;

      // Day Header Banner
      ensureSpace(14);
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, currentY, contentWidth, 9, 2, 2, 'FD');

      // Teal Pill for Day #
      doc.setFillColor(13, 148, 136);
      doc.roundedRect(margin + 2, currentY + 1.5, 18, 6, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text(`DAY ${d + 1}`, margin + 11, currentY + 5.5, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`Scheduled Itinerary — ${dayDateStr}`, margin + 24, currentY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`${dayStops.length} Destinations`, pageWidth - margin - 4, currentY + 6, { align: 'right' });

      currentY += 12;

      // Render each attraction card for this day
      for (let s = 0; s < dayStops.length; s++) {
        const { att, img } = dayStops[s];
        const cardHeight = 36; // compact, high-density card
        ensureSpace(cardHeight + 4);

        // Card Container
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, currentY, contentWidth, cardHeight, 2, 2, 'FD');

        // Image block (44mm x 30mm)
        const imgW = 44;
        const imgH = 30;
        const imgX = margin + 3;
        const imgY = currentY + 3;

        if (img && img.dataUrl) {
          try {
            doc.addImage(img.dataUrl, 'JPEG', imgX, imgY, imgW, imgH);
          } catch (e) {
            console.warn('Image render note:', e);
            drawFallbackImagePlaceholder(doc, imgX, imgY, imgW, imgH, att.cityName);
          }
        } else {
          drawFallbackImagePlaceholder(doc, imgX, imgY, imgW, imgH, att.cityName);
        }

        // Attraction Details (Right of image)
        const textX = imgX + imgW + 4;
        const textW = contentWidth - imgW - 10;

        // Slot & Category Pill
        const slot = timeSlots[s % timeSlots.length];
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(13, 148, 136); // Teal
        doc.text(`🕒 ${slot}`, textX, currentY + 7);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(234, 88, 12); // Orange
        doc.text(`•  ${att.cityName.toUpperCase()}`, textX + 44, currentY + 7);

        // Attraction Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        const truncatedTitle = doc.splitTextToSize(att.name, textW)[0];
        doc.text(truncatedTitle, textX, currentY + 13);

        // Subtitle / Rating
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        const sub = `${att.subtitle || ''}  |  ⭐ ${att.rating} rating (${att.reviewsCount || 1200}+ reviews)`;
        const truncatedSub = doc.splitTextToSize(sub, textW)[0];
        doc.text(truncatedSub, textX, currentY + 17.5);

        // Guidelines & Key Tips
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(51, 65, 85);
        const dress = att.dressCode ? `Dress: ${att.dressCode.substring(0, 38)}...` : 'Modest dress recommended';
        const best = att.bestTime ? `Best: ${att.bestTime}` : 'Early morning recommended';
        doc.text(`📌 ${dress}  |  🌅 ${best}`, textX, currentY + 22);

        // Entry Ticket & Pass details
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(15, 23, 42);
        const basePrice = att.prices?.basePrice ? `Entry: ₹${att.prices.basePrice}` : 'Free Entry';
        const fp = att.prices?.foreignPrice ? ` / Foreigners: ₹${att.prices.foreignPrice}` : '';
        doc.text(`🎟️ ${basePrice}${fp}  •  ⏱️ Duration: ${att.duration || '1.5-2 hrs'}`, textX, currentY + 26.5);

        // Food Pick Recommendation
        const food = foodPicks[s % foodPicks.length];
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6.8);
        doc.setTextColor(180, 83, 9); // Amber 700
        const truncatedFood = doc.splitTextToSize(`🍴 Recommended Stop: ${food}`, textW)[0];
        doc.text(truncatedFood, textX, currentY + 31);

        currentY += cardHeight + 4;
      }

      currentY += 2;
    }

    // ════════════════════════════════════════════════════════════════
    // 4. IMPORTANT VISITOR GUIDELINES & HELPLINES
    // ════════════════════════════════════════════════════════════════
    ensureSpace(38);

    doc.setFillColor(254, 252, 232); // Amber 50
    doc.setDrawColor(254, 240, 138); // Amber 200
    doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(146, 64, 14); // Amber 800
    doc.text('⚠️ ESSENTIAL VISITOR GUIDELINES & MONUMENT PROTOCOLS', margin + 4, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 53, 15);

    const tipsList = [
      '• Taj Mahal Friday Closure: Taj Mahal is strictly closed for tourists every Friday for religious prayers.',
      '• Vrindavan Temple Afternoon Break: Main sanctums close daily between 12:00 PM and 04:30 PM for Bhog/rest.',
      '• Footwear Regulations: Shoe covers required at Taj Mahal marble terrace. Free shoe storage at Banke Bihari & Prem Mandir.',
      '• Fast-Pass Access: Present your TravelTales booking confirmation on your phone at ASI fast-track gates.',
      '• 24/7 Tourist Helplines: UP Tourism Police: 112 | Medical Ambulance: 108 | TravelTales Concierge: +91 98765 43210'
    ];

    tipsList.forEach((t, i) => {
      doc.text(t, margin + 4, currentY + 11.5 + (i * 4.3));
    });

    currentY += 38;

    // Draw footers across all created pages
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      drawPageFooter(p, totalPages);
    }

    // Generate filename and trigger direct download
    const cleanHub = plannerState.startingPoint ? plannerState.startingPoint.replace(/-/g, '_') : 'Heritage';
    const fileName = `TravelTales_Itinerary_${plannerState.days}Days_${cleanHub}.pdf`;

    doc.save(fileName);
    return { success: true, fileName };

  } catch (err) {
    console.error('Error generating PDF:', err);
    throw err;
  }
}

// Fallback helper if an external image cannot be rendered on canvas
function drawFallbackImagePlaceholder(doc, x, y, w, h, city) {
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(x, y, w, h, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('TRAVELTALES', x + (w / 2), y + (h / 2) - 2, { align: 'center' });
  doc.setFontSize(7);
  doc.text(`${city} Monument`, x + (w / 2), y + (h / 2) + 3, { align: 'center' });
}
