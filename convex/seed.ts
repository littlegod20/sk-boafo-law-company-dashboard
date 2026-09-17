import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Run with: npx convex run seed:seed
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // ── Wipe existing data ───────────────────────────────────────────────────
    const tables = [
      "announcements", "messages", "leaveRequests",
      "invoices", "cases", "clients", "users",
    ] as const;

    for (const table of tables) {
      const rows = await ctx.db.query(table).collect();
      for (const row of rows) await ctx.db.delete(row._id);
    }

    // ── Users ────────────────────────────────────────────────────────────────
    const userDefs = [
      { name: "S.K. Boafo",       email: "sk.boafo@skboafo.gh",       role: "managing_partner" as const, dept: "Litigation & Dispute Resolution", barNumber: "GHA-BAR-2009-0047", joinedDate: "Jan 2009",  workPhone: "+233 30 277 0001", employeeId: "EMP-001" },
      { name: "Kwabena Asare",    email: "k.asare@skboafo.gh",         role: "partner"          as const, dept: "Litigation",                     barNumber: "GHA-BAR-2015-0112", joinedDate: "Aug 2015",  workPhone: "+233 30 277 0011", employeeId: "EMP-011" },
      { name: "Kojo Frimpong",    email: "k.frimpong@skboafo.gh",      role: "partner"          as const, dept: "Corporate Law",                  barNumber: "GHA-BAR-2012-0078", joinedDate: "Mar 2012",  workPhone: "+233 30 277 0002", employeeId: "EMP-002" },
      { name: "Kofi Mensah",      email: "k.mensah@skboafo.gh",        role: "associate"        as const, dept: "Litigation",                     barNumber: "GHA-BAR-2020-0201", joinedDate: "Feb 2020",  workPhone: "+233 30 277 0004", employeeId: "EMP-004" },
      { name: "Abena Asante",     email: "a.asante@skboafo.gh",        role: "associate"        as const, dept: "Conveyancing",                   barNumber: "GHA-BAR-2018-0167", joinedDate: "Jun 2018",  workPhone: "+233 30 277 0003", employeeId: "EMP-003" },
      { name: "Ama Darko",        email: "a.darko@skboafo.gh",         role: "paralegal"        as const, dept: "Corporate Law",                  barNumber: undefined,           joinedDate: "Sep 2021",  workPhone: "+233 30 277 0005", employeeId: "EMP-005" },
      { name: "Akua Twum",        email: "a.twum@skboafo.gh",          role: "paralegal"        as const, dept: "Conveyancing",                   barNumber: undefined,           joinedDate: "Mar 2024",  workPhone: "+233 30 277 0010", employeeId: "EMP-010" },
      { name: "Nana Acheampong",  email: "n.acheampong@skboafo.gh",    role: "admin"            as const, dept: "Administration",                 barNumber: undefined,           joinedDate: "Nov 2019",  workPhone: "+233 30 277 0009", employeeId: "EMP-009" },
      { name: "Yaa Bonsu",        email: "y.bonsu@skboafo.gh",         role: "hr_officer"       as const, dept: "Human Resources",               barNumber: undefined,           joinedDate: "Jul 2020",  workPhone: "+233 30 277 0008", employeeId: "EMP-008" },
    ];

    const userIds: Record<string, Id<"users">> = {};
    for (const u of userDefs) {
      const id = await ctx.db.insert("users", {
        name: u.name,
        email: u.email,
        role: u.role,
        dept: u.dept,
        barNumber: u.barNumber,
        joinedDate: u.joinedDate,
        workPhone: u.workPhone,
        employeeId: u.employeeId,
        isActive: true,
        isAnonymous: false,
      });
      userIds[u.email] = id;
    }

    // ── Clients ──────────────────────────────────────────────────────────────
    const clientDefs = [
      { clientRef: "CLT-001", name: "Ofori & Sons Ltd.",    type: "Corporate"  as const, contact: "+233 20 811 4401", email: "info@oforiandson.gh",       attorney: "A. Mensah", activeCases: 3, totalCases: 5, joined: "Mar 2022" },
      { clientRef: "CLT-002", name: "Adwoa Boateng",        type: "Individual" as const, contact: "+233 24 552 7703", email: "adwoa.b@gmail.com",          attorney: "K. Asante", activeCases: 1, totalCases: 2, joined: "Jan 2024" },
      { clientRef: "CLT-003", name: "Ghana Mining Co.",     type: "Corporate"  as const, contact: "+233 30 274 1100", email: "legal@ghanamining.com",      attorney: "E. Darko",  activeCases: 2, totalCases: 4, joined: "Jun 2021" },
      { clientRef: "CLT-004", name: "Kofi Agyeman",         type: "Individual" as const, contact: "+233 27 315 8890", email: "k.agyeman@outlook.com",      attorney: "A. Mensah", activeCases: 1, totalCases: 1, joined: "Aug 2026" },
      { clientRef: "CLT-005", name: "Accra Realty Ltd.",    type: "Corporate"  as const, contact: "+233 30 278 4450", email: "admin@accra-realty.gh",      attorney: "D. Owusu",  activeCases: 1, totalCases: 3, joined: "Sep 2020" },
      { clientRef: "CLT-006", name: "Yaa Asantewaa Trust",  type: "Trust"      as const, contact: "+233 32 204 7700", email: "trust@yaaasantewaa.org",     attorney: "K. Asante", activeCases: 0, totalCases: 2, joined: "Nov 2019" },
      { clientRef: "CLT-007", name: "TeleFlex Ghana",       type: "Corporate"  as const, contact: "+233 30 291 2233", email: "legal@teleflex.gh",          attorney: "E. Darko",  activeCases: 1, totalCases: 2, joined: "Feb 2023" },
      { clientRef: "CLT-008", name: "Kwame Osei",           type: "Individual" as const, contact: "+233 26 448 1122", email: "kwameosei.law@yahoo.com",    attorney: "D. Owusu",  activeCases: 1, totalCases: 1, joined: "Jul 2026" },
      { clientRef: "CLT-009", name: "Goldfields Minerals",  type: "Corporate"  as const, contact: "+233 30 299 5500", email: "compliance@goldfields.gh",   attorney: "E. Darko",  activeCases: 1, totalCases: 3, joined: "Apr 2019" },
      { clientRef: "CLT-010", name: "Akua Twum",            type: "Individual" as const, contact: "+233 20 767 3344", email: "akuatwum1987@gmail.com",     attorney: "K. Asante", activeCases: 1, totalCases: 1, joined: "Jun 2026" },
      { clientRef: "CLT-011", name: "Adom Broadcasting",    type: "Corporate"  as const, contact: "+233 30 281 7788", email: "legal@adom.com.gh",          attorney: "A. Mensah", activeCases: 1, totalCases: 2, joined: "Jan 2022" },
      { clientRef: "CLT-012", name: "Ama Sarpong",          type: "Individual" as const, contact: "+233 55 224 9910", email: "ama.sarpong@hotmail.com",    attorney: "D. Owusu",  activeCases: 0, totalCases: 1, joined: "Jun 2026" },
    ];

    const clientIds: Record<string, any> = {};
    for (const c of clientDefs) {
      const id = await ctx.db.insert("clients", {
        clientRef: c.clientRef,
        name: c.name,
        type: c.type,
        contact: c.contact,
        email: c.email,
        attorney: c.attorney,
        status: "Active",
        activeCases: c.activeCases,
        totalCases: c.totalCases,
        joined: c.joined,
      });
      clientIds[c.clientRef] = id;
    }

    // ── Cases ────────────────────────────────────────────────────────────────
    const caseDefs = [
      { caseNumber: "SKB-2026-047", clientRef: "CLT-001", clientType: "Corporate", type: "Corporate",        attorney: "A. Mensah", status: "Active"  as const, priority: "High"   as const, openedDate: "01 Sep 2026", nextHearing: "18 Sep 2026" },
      { caseNumber: "SKB-2026-046", clientRef: "CLT-002", clientType: "Individual",type: "Estate & Probate", attorney: "K. Asante", status: "Pending" as const, priority: "Medium" as const, openedDate: "28 Aug 2026", nextHearing: "22 Sep 2026" },
      { caseNumber: "SKB-2026-045", clientRef: "CLT-003", clientType: "Corporate", type: "Mining & Energy",  attorney: "E. Darko",  status: "Active"  as const, priority: "High"   as const, openedDate: "20 Aug 2026", nextHearing: "25 Sep 2026" },
      { caseNumber: "SKB-2026-044", clientRef: "CLT-004", clientType: "Individual",type: "Employment",       attorney: "A. Mensah", status: "On Hold" as const, priority: "Low"    as const, openedDate: "15 Aug 2026" },
      { caseNumber: "SKB-2026-043", clientRef: "CLT-005", clientType: "Corporate", type: "Real Estate",      attorney: "D. Owusu",  status: "Active"  as const, priority: "Medium" as const, openedDate: "10 Aug 2026", nextHearing: "01 Oct 2026" },
      { caseNumber: "SKB-2026-042", clientRef: "CLT-006", clientType: "Trust",     type: "Estate & Probate", attorney: "K. Asante", status: "Closed"  as const, priority: "Low"    as const, openedDate: "01 Jul 2026" },
      { caseNumber: "SKB-2026-041", clientRef: "CLT-007", clientType: "Corporate", type: "Telecom & Tech",   attorney: "E. Darko",  status: "Active"  as const, priority: "High"   as const, openedDate: "15 Jul 2026", nextHearing: "03 Oct 2026" },
      { caseNumber: "SKB-2026-040", clientRef: "CLT-008", clientType: "Individual",type: "Litigation",       attorney: "D. Owusu",  status: "Active"  as const, priority: "Medium" as const, openedDate: "08 Jul 2026", nextHearing: "07 Oct 2026" },
      { caseNumber: "SKB-2026-039", clientRef: "CLT-009", clientType: "Corporate", type: "Mining & Energy",  attorney: "E. Darko",  status: "Active"  as const, priority: "High"   as const, openedDate: "01 Jul 2026", nextHearing: "20 Sep 2026" },
      { caseNumber: "SKB-2026-038", clientRef: "CLT-010", clientType: "Individual",type: "Land & Chieftaincy",attorney: "K. Asante",status: "Pending" as const, priority: "Medium" as const, openedDate: "20 Jun 2026", nextHearing: "12 Oct 2026" },
      { caseNumber: "SKB-2026-037", clientRef: "CLT-011", clientType: "Corporate", type: "Telecom & Tech",   attorney: "A. Mensah", status: "Active"  as const, priority: "Medium" as const, openedDate: "10 Jun 2026", nextHearing: "15 Oct 2026" },
      { caseNumber: "SKB-2026-036", clientRef: "CLT-012", clientType: "Individual",type: "Employment",       attorney: "D. Owusu",  status: "Closed"  as const, priority: "Low"    as const, openedDate: "01 Jun 2026" },
    ];

    const caseIds: Record<string, any> = {};
    for (const c of caseDefs) {
      const id = await ctx.db.insert("cases", {
        caseNumber: c.caseNumber,
        clientId: clientIds[c.clientRef],
        clientName: clientDefs.find(cl => cl.clientRef === c.clientRef)!.name,
        clientType: c.clientType,
        type: c.type,
        status: c.status,
        priority: c.priority,
        attorney: c.attorney,
        openedDate: c.openedDate,
        nextHearing: c.nextHearing,
      });
      caseIds[c.caseNumber] = id;
    }

    // ── Invoices ─────────────────────────────────────────────────────────────
    const invoiceDefs = [
      { invoiceNumber: "INV-2026-041", clientRef: "CLT-003", caseNum: "SKB-2026-045", description: "Legal services — Aug 2026",   amount: 12500, status: "Sent"    as const, issueDate: "01 Sep 2026", dueDate: "01 Oct 2026", attorney: "E. Darko"  },
      { invoiceNumber: "INV-2026-040", clientRef: "CLT-001", caseNum: "SKB-2026-047", description: "Retainer — Q3 2026",          amount: 8000,  status: "Paid"    as const, issueDate: "01 Sep 2026", dueDate: "15 Sep 2026", attorney: "A. Mensah" },
      { invoiceNumber: "INV-2026-039", clientRef: "CLT-009", caseNum: "SKB-2026-039", description: "Consultation & filings — Aug", amount: 8200, status: "Paid"    as const, issueDate: "28 Aug 2026", dueDate: "12 Sep 2026", attorney: "E. Darko"  },
      { invoiceNumber: "INV-2026-038", clientRef: "CLT-005", caseNum: "SKB-2026-043", description: "Conveyancing services",        amount: 6800,  status: "Overdue" as const, issueDate: "15 Aug 2026", dueDate: "05 Sep 2026", attorney: "D. Owusu"  },
      { invoiceNumber: "INV-2026-037", clientRef: "CLT-007", caseNum: "SKB-2026-041", description: "Retainer — Aug 2026",         amount: 9500,  status: "Sent"    as const, issueDate: "01 Aug 2026", dueDate: "20 Sep 2026", attorney: "E. Darko"  },
      { invoiceNumber: "INV-2026-036", clientRef: "CLT-011", caseNum: "SKB-2026-037", description: "Regulatory advisory",         amount: 4200,  status: "Overdue" as const, issueDate: "01 Aug 2026", dueDate: "25 Aug 2026", attorney: "A. Mensah" },
      { invoiceNumber: "INV-2026-035", clientRef: "CLT-002", caseNum: "SKB-2026-046", description: "Estate administration",       amount: 3500,  status: "Paid"    as const, issueDate: "15 Jul 2026", dueDate: "01 Aug 2026", attorney: "K. Asante" },
      { invoiceNumber: "INV-2026-034", clientRef: "CLT-008", caseNum: "SKB-2026-040", description: "Litigation services",         amount: 5600,  status: "Sent"    as const, issueDate: "15 Jul 2026", dueDate: "15 Sep 2026", attorney: "D. Owusu"  },
    ];

    for (const inv of invoiceDefs) {
      const client = clientDefs.find(c => c.clientRef === inv.clientRef)!;
      await ctx.db.insert("invoices", {
        invoiceNumber: inv.invoiceNumber,
        clientId: clientIds[inv.clientRef],
        clientName: client.name,
        caseId: caseIds[inv.caseNum],
        type: "Legal Services",
        amount: inv.amount,
        status: inv.status,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        attorney: inv.attorney,
        description: inv.description,
      });
    }

    // ── Leave Requests ────────────────────────────────────────────────────────
    // Note: these use employeeId — mapping by email to the seeded user
    const leaveDefs = [
      { employeeEmail: "y.bonsu@skboafo.gh",     employeeName: "Yaa Bonsu",      role: "HR Officer",   type: "Annual Leave",    from: "22 Sep 2026", to: "26 Sep 2026", days: 5,  status: "Pending"  as const, applied: "15 Sep 2026" },
      { employeeEmail: "k.mensah@skboafo.gh",    employeeName: "Kofi Mensah",    role: "Associate",    type: "Sick Leave",      from: "17 Sep 2026", to: "17 Sep 2026", days: 1,  status: "Pending"  as const, applied: "16 Sep 2026" },
      { employeeEmail: "a.darko@skboafo.gh",     employeeName: "Ama Darko",      role: "Paralegal",    type: "Emergency Leave", from: "18 Sep 2026", to: "19 Sep 2026", days: 2,  status: "Pending"  as const, applied: "16 Sep 2026" },
      { employeeEmail: "k.mensah@skboafo.gh",    employeeName: "Kofi Mensah",    role: "Associate",    type: "Annual Leave",    from: "02 Sep 2026", to: "04 Sep 2026", days: 3,  status: "Approved" as const, applied: "28 Aug 2026", approvedBy: "K. Asare", approvedByEmail: "k.asare@skboafo.gh" },
      { employeeEmail: "a.asante@skboafo.gh",    employeeName: "Abena Asante",   role: "Associate",    type: "Annual Leave",    from: "25 Aug 2026", to: "29 Aug 2026", days: 5,  status: "Approved" as const, applied: "20 Aug 2026", approvedBy: "K. Asare", approvedByEmail: "k.asare@skboafo.gh" },
      { employeeEmail: "k.frimpong@skboafo.gh",  employeeName: "Kojo Frimpong",  role: "Partner",      type: "Study Leave",     from: "18 Aug 2026", to: "22 Aug 2026", days: 5,  status: "Approved" as const, applied: "12 Aug 2026", approvedBy: "S.K. Boafo", approvedByEmail: "sk.boafo@skboafo.gh" },
      { employeeEmail: "y.bonsu@skboafo.gh",     employeeName: "Yaa Bonsu",      role: "HR Officer",   type: "Sick Leave",      from: "20 Aug 2026", to: "20 Aug 2026", days: 1,  status: "Approved" as const, applied: "19 Aug 2026", approvedBy: "S.K. Boafo", approvedByEmail: "sk.boafo@skboafo.gh" },
      { employeeEmail: "k.mensah@skboafo.gh",    employeeName: "Kofi Mensah",    role: "Associate",    type: "Annual Leave",    from: "05 Aug 2026", to: "07 Aug 2026", days: 3,  status: "Declined" as const, applied: "01 Aug 2026", approvedBy: "K. Asare", approvedByEmail: "k.asare@skboafo.gh" },
      { employeeEmail: "a.darko@skboafo.gh",     employeeName: "Ama Darko",      role: "Paralegal",    type: "Annual Leave",    from: "28 Jul 2026", to: "01 Aug 2026", days: 5,  status: "Approved" as const, applied: "22 Jul 2026", approvedBy: "K. Asare", approvedByEmail: "k.asare@skboafo.gh" },
    ];

    for (const lr of leaveDefs) {
      const approvedByEmail = "approvedByEmail" in lr ? (lr as { approvedByEmail?: string }).approvedByEmail : undefined;
      await ctx.db.insert("leaveRequests", {
        employeeId: userIds[lr.employeeEmail],
        employeeName: lr.employeeName,
        role: lr.role,
        type: lr.type,
        from: lr.from,
        to: lr.to,
        days: lr.days,
        status: lr.status,
        appliedDate: lr.applied,
        approvedById: approvedByEmail ? userIds[approvedByEmail] : undefined,
        approvedByName: "approvedBy" in lr ? (lr as { approvedBy?: string }).approvedBy : undefined,
      });
    }

    // ── Announcements ─────────────────────────────────────────────────────────
    const announcements = [
      { title: "Welcome to the new practice dashboard", content: "The S.K. Boafo & Company practice management system is now live. All case records, billing, and HR functions are accessible from here. Please update your profiles in Account Settings.", audience: "all", category: "General", pinned: true },
      { title: "Q3 Court Calendar reminder", content: "The Accra High Court resumes civil hearings on 18 September 2026. Please ensure all briefs for matters listed in September are filed by the 10th.", audience: "legal", category: "Court Notice", pinned: true },
      { title: "Leave application deadline", content: "All leave applications for October 2026 must be submitted by 25 September 2026. Applications submitted after this date may not be processed in time.", audience: "all", category: "HR", pinned: false },
    ];

    for (const a of announcements) {
      await ctx.db.insert("announcements", {
        title: a.title,
        content: a.content,
        authorId: userIds["sk.boafo@skboafo.gh"],
        authorName: "S.K. Boafo",
        audience: a.audience,
        category: a.category,
        pinned: a.pinned,
      });
    }

    // ── Welcome message ───────────────────────────────────────────────────────
    await ctx.db.insert("messages", {
      fromId: userIds["sk.boafo@skboafo.gh"],
      fromName: "S.K. Boafo",
      toId: userIds["k.asare@skboafo.gh"],
      subject: "Q4 Strategy — your input needed",
      content: "Kwabena, please review the attached court calendar and share your thoughts on resource allocation for the mining matters in Q4.",
      read: false,
    });

    return { status: "Seed complete", users: userDefs.length, clients: clientDefs.length, cases: caseDefs.length, invoices: invoiceDefs.length };
  },
});
