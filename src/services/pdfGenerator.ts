import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentProfile, SubjectCalculated } from '../types';
import { BulletinExtra } from './storage';

export interface GeneratePdfOptions {
  profile: StudentProfile;
  subjectsCalculated: SubjectCalculated[];
  totalCoeffs: number;
  totalPoints: number;
  generalAverage: number;
  extra: BulletinExtra;
}

export function generateBeninBulletinPdf(options: GeneratePdfOptions): jsPDF {
  const { profile, subjectsCalculated, totalCoeffs, totalPoints, generalAverage, extra } = options;

  // Création du document A4 Portrait (210 x 297 mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;

  // Bordure décorative institutionnelle
  doc.setDrawColor(26, 77, 46); // Vert profond Bénin
  doc.setLineWidth(0.6);
  doc.rect(margin - 2, margin - 2, pageWidth - 2 * (margin - 2), 277);

  doc.setDrawColor(218, 165, 32); // Or / Jaune Bénin
  doc.setLineWidth(0.2);
  doc.rect(margin - 1, margin - 1, pageWidth - 2 * (margin - 1), 275);

  // Bannière Tricolore Bénin (Vert - Jaune - Rouge) discrète en haut
  doc.setFillColor(0, 135, 81); // Vert drapeau
  doc.rect(margin, margin, 62, 2.5, 'F');
  doc.setFillColor(252, 209, 22); // Jaune drapeau
  doc.rect(margin + 62, margin, 62, 2.5, 'F');
  doc.setFillColor(232, 17, 45); // Rouge drapeau
  doc.rect(margin + 124, margin, 62, 2.5, 'F');

  // En-tête Institutionnel
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 20, 20);
  doc.text('RÉPUBLIQUE DU BÉNIN', margin + 2, margin + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Fraternité - Justice - Travail', margin + 2, margin + 10.5);
  doc.setFontSize(7.5);
  doc.text('MINISTÈRE DES ENSEIGNEMENTS SECONDAIRE,', margin + 2, margin + 14.5);
  doc.text('TECHNIQUE ET DE LA FORMATION PROFESSIONNELLE', margin + 2, margin + 18);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.schoolName.toUpperCase(), margin + 2, margin + 22);

  // Bloc Année Scolaire & Titre Bulletin (À droite)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`ANNÉE SCOLAIRE : ${profile.academicYear}`, pageWidth - margin - 2, margin + 7, { align: 'right' });
  doc.setFillColor(240, 244, 255);
  doc.setDrawColor(59, 130, 246);
  doc.roundedRect(pageWidth - margin - 75, margin + 11, 75, 12, 2, 2, 'FD');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text('BULLETIN DE NOTES', pageWidth - margin - 37.5, margin + 16, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(profile.term.toUpperCase(), pageWidth - margin - 37.5, margin + 21, { align: 'center' });

  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, margin + 26, pageWidth - margin, margin + 26);

  // Cadre d'identification de l'élève
  const studentBoxY = margin + 28;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, studentBoxY, pageWidth - 2 * margin, 18, 1.5, 1.5, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  // Ligne 1
  doc.setFont('helvetica', 'bold');
  doc.text('Nom & Prénoms :', margin + 4, studentBoxY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(`${profile.lastName.toUpperCase()} ${profile.firstName}`, margin + 34, studentBoxY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Matricule :', margin + 115, studentBoxY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.text(profile.matricule || 'N/A', margin + 132, studentBoxY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Sexe :', margin + 165, studentBoxY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.text(profile.gender === 'F' ? 'Féminin' : 'Masculin', margin + 175, studentBoxY + 5.5);

  // Ligne 2
  doc.setFont('helvetica', 'bold');
  doc.text('Classe :', margin + 4, studentBoxY + 12.5);
  doc.setFont('helvetica', 'normal');
  doc.text(profile.gradeLevel, margin + 20, studentBoxY + 12.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Effectif :', margin + 70, studentBoxY + 12.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${extra.classSize} élèves`, margin + 85, studentBoxY + 12.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Statut :', margin + 115, studentBoxY + 12.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Régulier(e)', margin + 130, studentBoxY + 12.5);

  // Construction du tableau de notes
  const tableRows = subjectsCalculated.map(item => {
    const mi = item.interroAverage !== null ? item.interroAverage.toFixed(2) : '-';
    const dev = item.devoirAverage !== null ? item.devoirAverage.toFixed(2) : '-';
    const moy = item.hasGrades ? item.currentAverage.toFixed(2) : '-';
    const coeff = item.subject.coefficient;
    const pts = item.hasGrades ? (item.currentAverage * coeff).toFixed(2) : '-';

    let appreciation = extra.teacherRemarks[item.subject.name] || '';
    if (!appreciation && item.hasGrades) {
      if (item.currentAverage >= 16) appreciation = 'Excellent travail !';
      else if (item.currentAverage >= 14) appreciation = 'Très bon trimestre.';
      else if (item.currentAverage >= 12) appreciation = 'Bon travail, régulier.';
      else if (item.currentAverage >= 10) appreciation = 'Passable, doit persévérer.';
      else appreciation = 'Efforts insuffisants, soutien requis.';
    }

    return [
      item.subject.name,
      mi,
      dev,
      moy,
      coeff.toString(),
      pts,
      appreciation,
    ];
  });

  // Tableau des matières avec jspdf-autotable
  autoTable(doc, {
    startY: studentBoxY + 21,
    margin: { left: margin, right: margin },
    head: [[
      'DISCIPLINES',
      'MOY. INT. (/20)',
      'DEVOIR (/20)',
      'MOYENNE (/20)',
      'COEF.',
      'POINTS',
      'APPRÉCIATIONS DES PROFESSEURS',
    ]],
    body: tableRows,
    foot: [[
      'TOTAUX & MOYENNE GÉNÉRALE',
      '',
      '',
      `${generalAverage.toFixed(2)} / 20`,
      `${totalCoeffs}`,
      `${totalPoints.toFixed(2)}`,
      `Mention : ${getMention(generalAverage)}`,
    ]],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138], // Indigo 900
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold', cellWidth: 42 },
      1: { halign: 'center', cellWidth: 22 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', fontStyle: 'bold', cellWidth: 22 },
      4: { halign: 'center', cellWidth: 14 },
      5: { halign: 'center', cellWidth: 18 },
      6: { halign: 'left', cellWidth: 'auto', fontSize: 6.8 },
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      cellPadding: 2.5,
    },
    didParseCell: (data) => {
      // Colorer les notes faibles ou excellentes
      if (data.section === 'body' && data.column.index === 3) {
        const val = parseFloat(data.cell.raw as string);
        if (!isNaN(val)) {
          if (val < 10) {
            data.cell.styles.textColor = [220, 38, 38]; // Rouge
          } else if (val >= 14) {
            data.cell.styles.textColor = [16, 149, 83]; // Vert
          }
        }
      }
    },
  });

  // Récupération de la position Y après le tableau
  const lastTable = (doc as any).lastAutoTable;
  let finalY = lastTable ? lastTable.finalY + 4 : 175;

  // Boîte des statistiques de la classe et Rang
  const statBoxWidth = (pageWidth - 2 * margin - 4) / 2;

  // Encadré 1 : Performance de la classe & Rang
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, finalY, statBoxWidth, 26, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 58, 138);
  doc.text('BILAN DE LA CLASSE & CLASSEMENT', margin + 3, finalY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text(`• Rang de l'élève :`, margin + 4, finalY + 9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9); // Ambre/Orange
  doc.text(`${extra.rank} sur ${extra.classSize} élèves`, margin + 32, finalY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`• Moyenne de la classe :`, margin + 4, finalY + 14);
  doc.text(`${extra.classAverage.toFixed(2)} / 20`, margin + 38, finalY + 14);

  doc.text(`• Plus forte moyenne :`, margin + 4, finalY + 18.5);
  doc.setTextColor(16, 149, 83);
  doc.text(`${extra.bestAverage.toFixed(2)} / 20`, margin + 38, finalY + 18.5);

  doc.setTextColor(51, 65, 85);
  doc.text(`• Plus faible moyenne :`, margin + 4, finalY + 23);
  doc.setTextColor(220, 38, 38);
  doc.text(`${extra.lowestAverage.toFixed(2)} / 20`, margin + 38, finalY + 23);

  // Encadré 2 : Assiduité, Discipline & Décision du Conseil
  const box2X = margin + statBoxWidth + 4;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(box2X, finalY, statBoxWidth, 26, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 58, 138);
  doc.text('DISCIPLINE, ASSIDUITÉ & DÉCISION', box2X + 3, finalY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text(`• Absences justifiées : ${extra.absencesJustified}h   • Non justifiées : ${extra.absencesUnjustified}h`, box2X + 4, finalY + 9);
  doc.text(`• Retards : ${extra.latenessCount}    • Conduite : ${extra.conductAppreciation}`, box2X + 4, finalY + 13.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(`DÉCISION DU CONSEIL DE CLASSE :`, box2X + 4, finalY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 149, 83);
  doc.text(extra.councilDecision, box2X + 4, finalY + 22.5);

  // Signatures
  const signY = finalY + 30;
  const colWidth = (pageWidth - 2 * margin) / 3;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  doc.text('Le Professeur Principal,', margin + 6, signY);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('(Visa et observations)', margin + 6, signY + 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Le Chef d'Établissement,", margin + colWidth + 8, signY);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('(Signature et Sceau officiel)', margin + colWidth + 8, signY + 4);

  // Simulation tampon officiel béninois
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin + colWidth + 14, signY + 7, 34, 14, 2, 2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(30, 58, 138);
  doc.text('RÉPUBLIQUE DU BÉNIN', margin + colWidth + 31, signY + 11.5, { align: 'center' });
  doc.text('DIRECTION DES ÉTUDES', margin + colWidth + 31, signY + 15, { align: 'center' });
  doc.text('★ VU & CERTIFIÉ ★', margin + colWidth + 31, signY + 18.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Visa des Parents / Tuteur,', margin + 2 * colWidth + 10, signY);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('(Date et signature)', margin + 2 * colWidth + 10, signY + 4);

  // Bas de page : Créateur TGLD & FASTEK
  const footerY = 282;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 58, 138);
  doc.text('TGLD School V1', margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(' • Application mobile de suivi scolaire  •  Créé par ', margin + 24, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TGLD', margin + 74, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(' — Powered by ', margin + 83, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text('FASTEK', margin + 102, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const nowStr = new Date().toLocaleDateString('fr-FR');
  doc.text(`Édité le ${nowStr} à Cotonou / Porto-Novo`, pageWidth - margin, footerY, { align: 'right' });

  return doc;
}

function getMention(average: number): string {
  if (average >= 16) return 'Très Bien (Félicitations)';
  if (average >= 14) return 'Bien (Tableau d’Honneur)';
  if (average >= 12) return 'Assez Bien (Encouragements)';
  if (average >= 10) return 'Passable';
  if (average >= 8) return 'Insuffisant (Travail à redoubler)';
  return 'Médiocre (Avertissement)';
}
