document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');

  // Input Field Selectors
  const startKmInput = form.querySelector('input[name="startKm"]');
  const endKmInput = form.querySelector('input[name="endKm"]');
  const totalKmInput = form.querySelector('input[name="totalKm"]');

  const rentInput = form.querySelector('input[name="rent"]');
  const extraKmInput = form.querySelector('input[name="extraKm"]');
  const extraHoursInput = form.querySelector('input[name="extraHours"]');
  const nightChargesInput = form.querySelector('input[name="nightCharges"]');
  const fuelChargesInput = form.querySelector('input[name="fuelCharges"]');
  const permitChargesInput = form.querySelector('input[name="permitCharges"]');
  const discountInput = form.querySelector('input[name="discount"]');
  const gstInput = form.querySelector('input[name="gst"]');
  const advanceInput = form.querySelector('input[name="advance"]');

  const grandTotalInput = form.querySelector('input[name="grandTotal"]');
  const balanceInput = form.querySelector('input[name="balance"]');

  // Helper function to safely parse numerical values
  const getNumValue = (input) => {
    const val = parseFloat(input.value);
    return isNaN(val) ? 0 : val;
  };

  // Primary Calculation Logic
  const calculateBill = () => {
    // 1. Calculate Total Kilometers
    const startKm = getNumValue(startKmInput);
    const endKm = getNumValue(endKmInput);
    let totalKm = 0;

    if (endKm >= startKm) {
      totalKm = endKm - startKm;
      totalKmInput.value = totalKm;
    } else {
      totalKmInput.value = '';
    }

    // 2. Sum up Base Fees and Extra Operational Charges
    const rent = getNumValue(rentInput);
    const extraKm = getNumValue(extraKmInput);
    const extraHours = getNumValue(extraHoursInput);
    const nightCharges = getNumValue(nightChargesInput);
    const fuelCharges = getNumValue(fuelChargesInput);
    const permitCharges = getNumValue(permitChargesInput);
    const discount = getNumValue(discountInput);

    const subTotalBeforeGst = (rent + extraKm + extraHours + nightCharges + fuelCharges + permitCharges) - discount;
    const baseAmount = Math.max(0, subTotalBeforeGst);

    // 3. Apply Taxes (GST)
    const gstPercent = getNumValue(gstInput);
    const gstAmount = baseAmount * (gstPercent / 100);
    const grandTotal = baseAmount + gstAmount;

    grandTotalInput.value = grandTotal.toFixed(2);

    // 4. Determine Pending Dues / Balance
    const advancePaid = getNumValue(advanceInput);
    const balanceDue = grandTotal - advancePaid;

    balanceInput.value = balanceDue.toFixed(2);
  };

  // Attach event listeners for real-time calculation execution
  const trackingFields = [
    startKmInput, endKmInput, rentInput, extraKmInput,
    extraHoursInput, nightChargesInput, fuelChargesInput,
    permitChargesInput, discountInput, gstInput, advanceInput
  ];

  trackingFields.forEach(field => {
    if (field) {
      field.addEventListener('input', calculateBill);
    }
  });

  // ---------------------------------------------------------------
  // Shared helper: pull every field on the form into a plain object
  // ---------------------------------------------------------------
  const getFieldVal = (name) => {
    const el = form.querySelector(`[name="${name}"]`);
    return el ? (el.value || '').trim() : '';
  };

  const fmtMoney = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? '0.00' : n.toFixed(2);
  };

  const collectBillData = () => {
    return {
      billNo: getFieldVal('billNo') || '-',
      invoiceDate: getFieldVal('invoiceDate') || '-',
      paymentStatus: getFieldVal('paymentStatus') || '-',

      customerName: getFieldVal('customerName') || '-',
      mobile: getFieldVal('mobile') || '-',
      email: getFieldVal('email') || '-',
      address: getFieldVal('address') || '-',

      driverName: getFieldVal('driverName') || '-',
      driverMobile: getFieldVal('driverMobile') || '-',
      license: getFieldVal('license') || '-',
      vehicle: getFieldVal('vehicle') || '-',
      vehicleNumber: getFieldVal('vehicleNumber') || '-',
      ratePerKm: getFieldVal('ratePerKm') || '0',

      tripType: getFieldVal('tripType') || '-',
      startPlace: getFieldVal('startPlace') || '-',
      endPlace: getFieldVal('endPlace') || '-',
      startDate: getFieldVal('startDate') || '-',
      endDate: getFieldVal('endDate') || '-',
      totalDays: getFieldVal('totalDays') || '0',
      totalHours: getFieldVal('totalHours') || '0',

      startKm: getFieldVal('startKm') || '0',
      endKm: getFieldVal('endKm') || '0',
      totalKm: getFieldVal('totalKm') || '0',

      rent: getFieldVal('rent') || '0',
      extraKm: getFieldVal('extraKm') || '0',
      extraHours: getFieldVal('extraHours') || '0',
      nightCharges: getFieldVal('nightCharges') || '0',
      fuelCharges: getFieldVal('fuelCharges') || '0',
      permitCharges: getFieldVal('permitCharges') || '0',
      discount: getFieldVal('discount') || '0',
      gst: getFieldVal('gst') || '0',
      advance: getFieldVal('advance') || '0',
      grandTotal: getFieldVal('grandTotal') || '0.00',
      balance: getFieldVal('balance') || '0.00',

      paymentMode: getFieldVal('paymentMode') || '-',
      upiTxnId: getFieldVal('upiTxnId') || '-'
    };
  };

  // Build a plain-text summary used for both Email and WhatsApp
  const buildTextSummary = (d) => {
    return [
      `*MUTHAMIZH TOURS & TRAVELS*`,
      `Bill No: ${d.billNo}   Date: ${d.invoiceDate}   Status: ${d.paymentStatus}`,
      ``,
      `Customer: ${d.customerName}`,
      `Mobile: ${d.mobile}`,
      ``,
      `Vehicle: ${d.vehicle} (${d.vehicleNumber})`,
      `Driver: ${d.driverName} (${d.driverMobile})`,
      ``,
      `Trip: ${d.tripType} | ${d.startPlace} -> ${d.endPlace}`,
      `Pickup: ${d.startDate}   Drop: ${d.endDate}`,
      `Total Days: ${d.totalDays}   Total Hours: ${d.totalHours}   Total KM: ${d.totalKm}`,
      ``,
      `--- Charges ---`,
      `Vehicle Rent: Rs.${fmtMoney(d.rent)}`,
      `Extra KM Charges: Rs.${fmtMoney(d.extraKm)}`,
      `Extra Hours Charges: Rs.${fmtMoney(d.extraHours)}`,
      `Night Charges: Rs.${fmtMoney(d.nightCharges)}`,
      `Fuel Charges: Rs.${fmtMoney(d.fuelCharges)}`,
      `Permit/Toll/Parking: Rs.${fmtMoney(d.permitCharges)}`,
      `Discount: Rs.${fmtMoney(d.discount)}`,
      `GST: ${d.gst}%`,
      `Advance Paid: Rs.${fmtMoney(d.advance)}`,
      ``,
      `*Grand Total: Rs.${fmtMoney(d.grandTotal)}*`,
      `*Balance Due: Rs.${fmtMoney(d.balance)}*`,
      ``,
      `Payment Mode: ${d.paymentMode}`,
      `Thank you for choosing Muthamizh Tours & Travels!`
    ].join('\n');
  };

  // Basic validation before sending / generating anything
  const validateBeforeAction = (d) => {
    if (d.customerName === '-' || d.customerName === '') {
      alert('Please enter the Customer Name before continuing.');
      return false;
    }
    return true;
  };

  // Action Buttons
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Invoice saved successfully!');
  });

  // ---------------------------------------------------------------
  // GENERATE PDF — builds a real, downloadable PDF using jsPDF
  // ---------------------------------------------------------------
  const btnPdf = form.querySelector('input[value="Generate PDF"]');
  if (btnPdf) {
    btnPdf.addEventListener('click', () => {
      const d = collectBillData();
      if (!validateBeforeAction(d)) return;

      if (!window.jspdf) {
        alert('PDF library failed to load. Please check your internet connection and try again.');
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      let y = 50;

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(26, 54, 93);
      doc.text('MUTHAMIZH TOURS & TRAVELS', pageWidth / 2, y, { align: 'center' });

      y += 20;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(90, 90, 90);
      doc.text('123 Travel Plaza, Main Road, Chennai, Tamil Nadu - 600001', pageWidth / 2, y, { align: 'center' });
      y += 15;
      doc.text('Contact: +91 98765 43210 | info@muthamizhtours.com', pageWidth / 2, y, { align: 'center' });

      y += 20;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 25;

      const addLine = (label, value, colX2) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(label, colX2 ? colX2 : margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), (colX2 ? colX2 : margin) + 90, y);
      };

      const sectionTitle = (title) => {
        y += 8;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(43, 108, 176);
        doc.text(title, margin, y);
        y += 16;
      };

      sectionTitle('Bill Details');
      addLine('Bill No:', d.billNo);
      addLine('Date:', d.invoiceDate, pageWidth / 2);
      y += 16;
      addLine('Status:', d.paymentStatus);
      y += 20;

      sectionTitle('Customer Details');
      addLine('Name:', d.customerName);
      addLine('Mobile:', d.mobile, pageWidth / 2);
      y += 16;
      addLine('Email:', d.email);
      y += 20;

      sectionTitle('Driver & Vehicle Details');
      addLine('Driver:', d.driverName);
      addLine('Driver Mobile:', d.driverMobile, pageWidth / 2);
      y += 16;
      addLine('License No:', d.license);
      addLine('Vehicle:', d.vehicle, pageWidth / 2);
      y += 16;
      addLine('Vehicle No:', d.vehicleNumber);
      addLine('Rate/KM:', 'Rs.' + fmtMoney(d.ratePerKm), pageWidth / 2);
      y += 20;

      sectionTitle('Trip Details');
      addLine('Trip Type:', d.tripType);
      y += 16;
      addLine('From:', d.startPlace);
      addLine('To:', d.endPlace, pageWidth / 2);
      y += 16;
      addLine('Pickup:', d.startDate);
      y += 16;
      addLine('Drop:', d.endDate);
      y += 16;
      addLine('Days:', d.totalDays);
      addLine('Hours:', d.totalHours, pageWidth / 2);
      y += 16;
      addLine('Total KM:', d.totalKm);
      y += 20;

      sectionTitle('Charges Breakdown');
      const charges = [
        ['Vehicle Rent', d.rent],
        ['Extra KM Charges', d.extraKm],
        ['Extra Hours Charges', d.extraHours],
        ['Night Charges', d.nightCharges],
        ['Fuel Charges', d.fuelCharges],
        ['Permit/Toll/Parking', d.permitCharges],
        ['Discount', '-' + fmtMoney(d.discount)],
        ['GST', d.gst + '%'],
        ['Advance Paid', d.advance]
      ];
      charges.forEach(([label, val]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(70, 70, 70);
        doc.text(label, margin, y);
        const displayVal = label === 'GST' ? String(val) : 'Rs.' + fmtMoney(val);
        doc.text(displayVal, pageWidth - margin, y, { align: 'right' });
        y += 16;
      });

      y += 8;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 22;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(56, 161, 105);
      doc.text('Grand Total', margin, y);
      doc.text('Rs.' + fmtMoney(d.grandTotal), pageWidth - margin, y, { align: 'right' });
      y += 20;

      doc.setTextColor(197, 48, 48);
      doc.text('Balance Due', margin, y);
      doc.text('Rs.' + fmtMoney(d.balance), pageWidth - margin, y, { align: 'right' });
      y += 24;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(70, 70, 70);
      doc.text('Payment Mode: ' + d.paymentMode, margin, y);

      y += 30;
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text('Terms: Tolls, parking and permit charges are borne by the customer unless quoted otherwise.', margin, y, { maxWidth: pageWidth - margin * 2 });
      y += 14;
      doc.text('Night charges apply for journeys between 10:00 PM and 6:00 AM.', margin, y, { maxWidth: pageWidth - margin * 2 });

      const safeBillNo = (d.billNo || 'invoice').toString().replace(/[^a-z0-9]/gi, '_');
      doc.save(`Muthamizh_Invoice_${safeBillNo}.pdf`);
    });
  }

  // ---------------------------------------------------------------
  // PRINT BILL
  // ---------------------------------------------------------------
  const btnPrint = form.querySelector('input[value="Print Bill"]');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // ---------------------------------------------------------------
  // SEND EMAIL — opens the user's email client with a pre-filled
  // subject and body via a mailto: link (no backend required)
  // ---------------------------------------------------------------
  const btnEmail = form.querySelector('input[value="Send Email"]');
  if (btnEmail) {
    btnEmail.addEventListener('click', () => {
      const d = collectBillData();
      if (!validateBeforeAction(d)) return;

      let toAddress = d.email;
      if (!toAddress || toAddress === '-' || !toAddress.includes('@')) {
        toAddress = prompt('Enter the customer\'s email address to send the invoice to:', '') || '';
      }

      const subject = `Invoice ${d.billNo !== '-' ? d.billNo : ''} - Muthamizh Tours & Travels`;
      const body = buildTextSummary(d).replace(/\*/g, '');

      const mailtoUrl = `mailto:${encodeURIComponent(toAddress)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    });
  }

  // ---------------------------------------------------------------
  // SEND WHATSAPP — opens WhatsApp (web or app) with the invoice
  // summary pre-filled, ready to send
  // ---------------------------------------------------------------
  const btnWhatsapp = form.querySelector('input[value="Send WhatsApp"]');
  if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', () => {
      const d = collectBillData();
      if (!validateBeforeAction(d)) return;

      let phone = (d.mobile || '').replace(/[^0-9+]/g, '');
      if (!phone) {
        phone = (prompt('Enter the customer\'s WhatsApp number (with country code, e.g. 91XXXXXXXXXX):', '') || '').replace(/[^0-9+]/g, '');
      }
      if (phone && phone.length === 10) {
        phone = '91' + phone;
      }
      phone = phone.replace('+', '');

      const text = buildTextSummary(d);
      const waUrl = phone
        ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
        : `https://wa.me/?text=${encodeURIComponent(text)}`;

      window.open(waUrl, '_blank');
    });
  }
});