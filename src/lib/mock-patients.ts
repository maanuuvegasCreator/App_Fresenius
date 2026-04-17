import raw from "@/data/mock-patients.json";

export type MockPatientOrder = {
  id: string;
  date: string;
  description: string;
  status: string;
};

export type MockPatient = {
  id: string;
  fullName: string;
  phoneE164: string;
  alternatePhones: string[];
  mrn: string;
  center: string;
  dateOfBirth: string;
  orders: MockPatientOrder[];
  clinicalNote: string;
};

const patients = (raw as { patients: MockPatient[] }).patients;

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

/** Coincide por E.164, últimos 9–11 dígitos o teléfonos alternativos del mock. */
export function findMockPatientByPhone(raw: string | null | undefined): MockPatient | null {
  if (!raw) return null;
  const d = digitsOnly(raw);
  if (!d) return null;

  for (const p of patients) {
    if (digitsOnly(p.phoneE164) === d) return p;
    for (const alt of p.alternatePhones) {
      if (digitsOnly(alt) === d) return p;
      if (d.length >= 9 && digitsOnly(alt).endsWith(d.slice(-9))) return p;
    }
    const main = digitsOnly(p.phoneE164);
    if (d.length >= 9 && main.endsWith(d.slice(-9))) return p;
    if (main.endsWith(d) || d.endsWith(main)) return p;
  }
  return null;
}

export function listMockPatients(): MockPatient[] {
  return [...patients];
}
