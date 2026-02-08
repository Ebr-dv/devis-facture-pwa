class PDFGenerator {
  static async generate(document, companyInfo) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');

    // Fond blanc
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 1100);

    // En-tête
    ctx.fillStyle = '#3498db';
    ctx.fillRect(0, 0, 800, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(document.type.toUpperCase(), 50, 50);

    // Infos entreprise
    ctx.fillStyle = '#333333';
    ctx.font = '12px Arial';
    ctx.fillText(companyInfo.companyName || 'Mon Entreprise', 50, 130);
    ctx.fillText(companyInfo.companyAddress || '', 50, 150);
    ctx.fillText(companyInfo.companyPhone || '', 50, 170);

    // Infos client
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Client:', 50, 220);
    ctx.font = '12px Arial';
    ctx.fillText(document.clientName || '', 50, 240);
    ctx.fillText(document.clientAddress || '', 50, 260);

    // Articles
    let yPos = 320;
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Description', 50, yPos);
    ctx.fillText('Quantité', 400, yPos);
    ctx.fillText('Prix', 500, yPos);
    ctx.fillText('Total', 650, yPos);

    ctx.strokeStyle = '#cccccc';
    ctx.beginPath();
    ctx.moveTo(50, yPos + 10);
    ctx.lineTo(750, yPos + 10);
    ctx.stroke();

    yPos += 30;
    ctx.font = '11px Arial';

    if (document.items && document.items.length > 0) {
      for (const item of document.items) {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        const total = (qty * price).toFixed(2);

        ctx.fillText(item.description || '', 50, yPos);
        ctx.fillText(qty.toString(), 400, yPos);
        ctx.fillText(price.toFixed(2) + '€', 500, yPos);
        ctx.fillText(total + '€', 650, yPos);

        yPos += 25;
      }
    }

    // Total
    const subtotal = (document.items || []).reduce((sum, item) => {
      return sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0));
    }, 0);

    yPos += 20;
    ctx.font = 'bold 12px Arial';
    ctx.fillText('MONTANT TOTAL:', 400, yPos);
    ctx.fillText(subtotal.toFixed(2) + '€', 650, yPos);

    // Notes
    if (document.notes) {
      yPos += 50;
      ctx.font = '10px Arial';
      ctx.fillText('Notes:', 50, yPos);
      yPos += 20;
      const noteLines = document.notes.split('\n');
      for (const line of noteLines) {
        ctx.fillText(line, 50, yPos);
        yPos += 15;
      }
    }

    // Pied de page
    ctx.fillStyle = '#999999';
    ctx.font = '9px Arial';
    ctx.fillText(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 50, 1050);

    // Convertir en image et télécharger
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${document.type}_${document.clientName}_${new Date().toISOString().split('T')[0]}.png`;
    link.click();
  }
}