import jsPDF from "jspdf";
import type { CaminoPlan } from "../types";
import { DIFFICULTY_LABELS, TRANSPORT_LABELS } from "../types";

export function downloadPlanPdf(plan: CaminoPlan) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - margin * 2;
  let y = 18;

  function checkPage(extra = 0) {
    if (y + extra > 285) {
      doc.addPage();
      y = 18;
    }
  }

  // Header
  doc.setFillColor(74, 124, 89);
  doc.rect(0, 0, pageWidth, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MI CAMINO", margin, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Tu Camino de Santiago, etapa a etapa", margin, 19);

  y = 30;
  doc.setTextColor(40, 40, 40);

  // Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(plan.camino, margin, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`${plan.origin} → ${plan.destination}`, margin, y);
  y += 5;
  doc.text(
    `${TRANSPORT_LABELS[plan.transportMode]}  •  ${plan.days} días  •  ≈ ${plan.totalDistance} km${plan.totalElevationGain ? `  •  +${plan.totalElevationGain} m` : ""}`,
    margin,
    y
  );
  y += 4;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Stages
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Etapas", margin, y);
  y += 6;

  plan.stages.forEach((stage) => {
    checkPage(42);
    const cardTop = y;

    // Card background
    doc.setFillColor(250, 250, 249);
    doc.setDrawColor(231, 229, 228);
    // Estimate height: we will draw after
    const startY = y;

    // Day badge
    doc.setFillColor(244, 197, 66);
    doc.roundedRect(margin, y, 18, 7, 1.5, 1.5, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(`DÍA ${stage.day}`, margin + 2.5, y + 4.8);

    // Title
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(`${stage.origin} → ${stage.destination}`, margin + 22, y + 5);

    y += 9;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const meta = `${stage.distance} km  •  ${stage.estimatedDuration || "—"}  •  ↗ +${stage.elevationGain || 0} m  •  ↘ -${stage.elevationLoss || 0} m  •  ${DIFFICULTY_LABELS[stage.difficulty]}`;
    doc.text(meta, margin, y);
    y += 5;

    // Description wrapped
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    const lines = doc.splitTextToSize(stage.description, usableWidth);
    doc.text(lines, margin, y);
    y += lines.length * 3.6 + 2;

    // Wikiloc URL
    if (stage.wikiloc?.url) {
      doc.setFontSize(7.5);
      doc.setTextColor(74, 124, 89);
      doc.setFont("helvetica", "normal");
      // underline effect
      doc.textWithLink("Ver ruta en Wikiloc →", margin, y, { url: stage.wikiloc.url });
      // doc.text(`Wikiloc: ${stage.wikiloc.url}`, margin, y);
      y += 4;
      doc.setFontSize(6.5);
      doc.setTextColor(110, 110, 110);
      const urlLines = doc.splitTextToSize(stage.wikiloc.url, usableWidth);
      // make clickable first line only for simplicity
      doc.text(urlLines[0], margin, y);
      y += 4;
    } else {
      y += 2;
    }

    // Draw border around card
    const cardHeight = y - startY + 3;
    // rewind to draw rect behind? Instead draw rect border on top
    doc.setDrawColor(231, 229, 228);
    doc.roundedRect(margin - 2, cardTop - 3, usableWidth + 4, cardHeight, 2, 2, "S");

    y += 4;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text(`Mi Camino Planner • Generado el ${new Date().toLocaleDateString("es-ES")} • Página ${i}/${totalPages}`, margin, 292);
  }

  doc.save(`MiCamino-${plan.origin}-Santiago-${plan.days}dias.pdf`);
}
