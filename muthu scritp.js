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

  // Tariff / package fields
  const packageKmInput = form.querySelector('input[name="packageKm"]');
  const packageHoursInput = form.querySelector('input[name="packageHours"]');
  const ratePerKmExtraInput = form.querySelector('input[name="ratePerKmExtra"]');
  const extraHourRateInput = form.querySelector('input[name="extraHourRate"]');
  const extraKmCountInput = form.querySelector('input[name="extraKmCount"]');
  const extraHoursCountInput = form.querySelector('input[name="extraHoursCount"]');
  const totalHoursInput = form.querySelector('input[name="totalHours"]');

  // Trip date/time + duration + rate + total amount fields
  const startDateInput = form.querySelector('input[name="startDate"]');
  const endDateInput = form.querySelector('input[name="endDate"]');
  const totalDaysInput = form.querySelector('input[name="totalDays"]');
  const ratePerKmInput = form.querySelector('input[name="ratePerKm"]');
  const totalAmountInput = form.querySelector('input[name="totalAmount"]');

  // Tariff rate card (AC / Non-AC per vehicle)
  const vehicleSelect = form.querySelector('select[name="vehicle"]');
  const acTypeSelect = form.querySelector('select[name="acType"]');
  const rateCardTable = document.getElementById('rateCardTable');

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

    // 2. Auto-calculate Total Days / Total Hours from pickup & drop date-time
    let computedHours = 0;
    let computedDays = 0;
    const startVal = startDateInput ? startDateInput.value : '';
    const endVal = endDateInput ? endDateInput.value : '';

    if (startVal && endVal) {
      const start = new Date(startVal);
      const end = new Date(endVal);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
        const diffMs = end - start;
        computedHours = diffMs / (1000 * 60 * 60);
        computedDays = Math.max(1, Math.ceil(computedHours / 24));
      }
    }
    if (totalDaysInput) totalDaysInput.value = computedDays || '';
    if (totalHoursInput) totalHoursInput.value = computedHours ? computedHours.toFixed(1) : '';

    // 3. Tariff Package settings (read first so Total Amount can be
    //    capped at the package limit and not double-count with Extra KM)
    const packageKm = getNumValue(packageKmInput);
    const packageHours = getNumValue(packageHoursInput);
    const ratePerKmExtra = getNumValue(ratePerKmExtraInput);
    const extraHourRate = getNumValue(extraHourRateInput);
    const totalHours = computedHours;

    // 4. Total Amount = (Total KM capped at Package KM) x Vehicle Rate per KM
    //    — this covers only the KM included in the package. Anything beyond
    //    the package is billed separately below as Extra KM Charges, so it
    //    is never counted twice.
    const ratePerKm = getNumValue(ratePerKmInput);
    const kmForBaseAmount = packageKm > 0 ? Math.min(totalKm, packageKm) : totalKm;
    const totalAmount = kmForBaseAmount * ratePerKm;
    if (totalAmountInput) totalAmountInput.value = totalAmount.toFixed(2);

    // 5. Extra KM / Extra Hours beyond the package, multiplied by their rates
    const extraKmCount = Math.max(0, totalKm - packageKm);
    const extraKmCharge = extraKmCount * ratePerKmExtra;
    if (extraKmCountInput) extraKmCountInput.value = extraKmCount ? extraKmCount.toFixed(1).replace(/\.0$/, '') : 0;
    if (extraKmInput) extraKmInput.value = extraKmCharge.toFixed(2);

    const extraHoursCount = Math.max(0, totalHours - packageHours);
    const extraHoursCharge = extraHoursCount * extraHourRate;
    if (extraHoursCountInput) extraHoursCountInput.value = extraHoursCount ? extraHoursCount.toFixed(1).replace(/\.0$/, '') : 0;
    if (extraHoursInput) extraHoursInput.value = extraHoursCharge.toFixed(2);

    // 6. Sum up Base Fees and Extra Operational Charges
    const rent = getNumValue(rentInput);
    const extraKm = getNumValue(extraKmInput);
    const extraHours = getNumValue(extraHoursInput);
    const nightCharges = getNumValue(nightChargesInput);
    const fuelCharges = getNumValue(fuelChargesInput);
    const permitCharges = getNumValue(permitChargesInput);
    const discount = getNumValue(discountInput);

    const subTotalBeforeGst = (rent + totalAmount + extraKm + extraHours + nightCharges + fuelCharges + permitCharges) - discount;
    const baseAmount = Math.max(0, subTotalBeforeGst);

    // 7. Apply Taxes (GST)
    const gstPercent = getNumValue(gstInput);
    const gstAmount = baseAmount * (gstPercent / 100);
    const grandTotal = baseAmount + gstAmount;

    grandTotalInput.value = grandTotal.toFixed(2);

    // 8. Determine Pending Dues / Balance
    const advancePaid = getNumValue(advanceInput);
    const balanceDue = grandTotal - advancePaid;

    balanceInput.value = balanceDue.toFixed(2);
  };

  // Attach event listeners for real-time calculation execution
  const trackingFields = [
    startKmInput, endKmInput, rentInput, nightChargesInput, fuelChargesInput,
    permitChargesInput, discountInput, gstInput, advanceInput,
    packageKmInput, packageHoursInput, ratePerKmExtraInput, extraHourRateInput,
    startDateInput, endDateInput, ratePerKmInput
  ];

  trackingFields.forEach(field => {
    if (field) {
      field.addEventListener('input', calculateBill);
    }
  });

  // ---------------------------------------------------------------
  // TARIFF RATE CARD — pick the rate for the selected Vehicle +
  // AC/Non-AC from the editable rate card table, and auto-fill it
  // into "Vehicle Rate per KM" and "Rate per Extra KM"
  // ---------------------------------------------------------------
  const applyRateCard = () => {
    if (!rateCardTable || !vehicleSelect || !acTypeSelect) return;

    const selectedVehicle = vehicleSelect.value;
    const isAc = acTypeSelect.value === 'AC';
    const rows = rateCardTable.querySelectorAll('tbody tr');

    let matchedRow = null;
    rows.forEach(row => {
      row.classList.remove('active-rate-row');
      if (row.getAttribute('data-vehicle') === selectedVehicle) {
        matchedRow = row;
      }
    });

    // "Other" vehicles may not have an exact row match; fall back to the "Other" row
    if (!matchedRow) {
      matchedRow = rateCardTable.querySelector('tr[data-vehicle="Other"]');
    }

    if (matchedRow) {
      matchedRow.classList.add('active-rate-row');
      const rateInput = matchedRow.querySelector(isAc ? '.rate-ac' : '.rate-nonac');
      if (rateInput && rateInput.value !== '') {
        const rateVal = rateInput.value;
        if (ratePerKmInput) ratePerKmInput.value = rateVal;
        if (ratePerKmExtraInput) ratePerKmExtraInput.value = rateVal;
      }
    }

    calculateBill();
  };

  if (vehicleSelect) vehicleSelect.addEventListener('change', applyRateCard);
  if (acTypeSelect) acTypeSelect.addEventListener('change', applyRateCard);

  if (rateCardTable) {
    rateCardTable.querySelectorAll('.rate-nonac, .rate-ac').forEach(cell => {
      cell.addEventListener('input', applyRateCard);
    });
  }

  // Apply the rate card once on load so the default Vehicle/AC selection
  // has a matching rate pre-filled from the start
  applyRateCard();

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

  // The KM actually billed inside Total Amount — capped at Package KM so it
  // never overlaps with Extra KM Charges. Mirrors the calculateBill() logic.
  const getKmForBaseAmount = (d) => {
    const totalKmNum = parseFloat(d.totalKm) || 0;
    const packageKmNum = parseFloat(d.packageKm) || 0;
    return packageKmNum > 0 ? Math.min(totalKmNum, packageKmNum) : totalKmNum;
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
      acType: getFieldVal('acType') || '-',
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
      totalAmount: getFieldVal('totalAmount') || '0',

      packageKm: getFieldVal('packageKm') || '0',
      packageHours: getFieldVal('packageHours') || '0',
      ratePerKmExtra: getFieldVal('ratePerKmExtra') || '0',
      extraHourRate: getFieldVal('extraHourRate') || '0',
      extraKmCount: getFieldVal('extraKmCount') || '0',
      extraHoursCount: getFieldVal('extraHoursCount') || '0',

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
      `Vehicle: ${d.vehicle} (${d.acType}) - ${d.vehicleNumber}`,
      `Driver: ${d.driverName} (${d.driverMobile})`,
      ``,
      `Trip: ${d.tripType} | ${d.startPlace} -> ${d.endPlace}`,
      `Pickup: ${d.startDate}   Drop: ${d.endDate}`,
      `Total Days: ${d.totalDays}   Total Hours: ${d.totalHours}   Total KM: ${d.totalKm}`,
      ``,
      `--- Charges ---`,
      `Total Amount: ${getKmForBaseAmount(d)} KM x Rs.${fmtMoney(d.ratePerKm)} = Rs.${fmtMoney(d.totalAmount)}`,
      `Package: ${d.packageKm} KM & ${d.packageHours} Hrs | Base Fare: Rs.${fmtMoney(d.rent)}`,
      `Extra KM: ${d.extraKmCount} x Rs.${fmtMoney(d.ratePerKmExtra)} = Rs.${fmtMoney(d.extraKm)}`,
      `Extra Hours: ${d.extraHoursCount} x Rs.${fmtMoney(d.extraHourRate)} = Rs.${fmtMoney(d.extraHours)}`,
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
      doc.text('47/kizh krishnapuram village thippasamuthiram post pallikonda via,anaicut taluk,vellore pin:635809', pageWidth / 2, y, { align: 'center' });
      y += 15;
      doc.text('Contact: 6382836143 & 8754269988 | Gmail:muthamizhtours@gmail.com ', pageWidth / 2, y, { align: 'center' });

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
      addLine('Vehicle:', `${d.vehicle} (${d.acType})`, pageWidth / 2);
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
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(70, 70, 70);
      doc.setFontSize(10);
      doc.text(`Package: ${d.packageKm} KM & ${d.packageHours} Hrs`, margin, y);
      doc.text('Rs.' + fmtMoney(d.rent), pageWidth - margin, y, { align: 'right' });
      y += 16;



      doc.text(`Base Fare  (${getKmForBaseAmount(d)} KM x Rs.${fmtMoney(d.ratePerKm)})`, margin, y);
      doc.text('Rs.' + fmtMoney(d.totalAmount), pageWidth - margin, y, { align: 'right' });
      y += 16;

  
      const charges = [
        [`Extra KM  (${d.extraKmCount} x Rs.${fmtMoney(d.ratePerKmExtra)})`, d.extraKm],
        [`Extra Hours  (${d.extraHoursCount} x Rs.${fmtMoney(d.extraHourRate)})`, d.extraHours],
        ['Night Charges', d.nightCharges],
        ['Fuel Charges', d.fuelCharges],
        ['Permit/Toll/Parking', d.permitCharges],
        ['Discount', '-' + fmtMoney(d.discount)],
        ['GST', d.gst + '%'],
        ['Advance Paid', d.advance]
      ];
      charges.forEach(([label, val]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
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
