import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { hashPbkdf2 } from "./crypto";

// Run with: npx convex run seed:seed
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // ── Wipe existing data ───────────────────────────────────────────────────
    const tables = [
      // Auth tables first (accounts reference users, sessions reference accounts)
      "authRefreshTokens", "authVerificationCodes", "authSessions", "authAccounts",
      // App tables
      "announcements", "messages", "leaveRequests", "users",
      "jobPostings", "jobApplicants", "onboardees", "exitClearances",
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

    // ── Leave Requests ────────────────────────────────────────────────────────
    // Note: these use employeeId — mapping by email to the seeded user
    const emailToId: Record<string, Id<"users">> = Object.fromEntries(
      userDefs.map((u) => [u.email, userIds[u.email]])
    );

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
      await ctx.db.insert("leaveRequests", {
        employeeId: emailToId[lr.employeeEmail],
        employeeName: lr.employeeName,
        role: lr.role,
        type: lr.type,
        from: lr.from,
        to: lr.to,
        days: lr.days,
        status: lr.status,
        appliedDate: lr.applied,
        approvedById: (lr as any).approvedByEmail ? emailToId[(lr as any).approvedByEmail] : undefined,
        approvedByName: (lr as any).approvedBy,
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

    // ── Job Postings ──────────────────────────────────────────────────────────
    const jobDefs = [
      { jobRef: "REC-2026-009", title: "Senior Associate — Litigation",    dept: "Litigation",        status: "Interviewing"   as const, applications: 14, posted: "01 Sep 2026", closing: "30 Sep 2026", hiringManagerName: "S.K. Boafo",     priority: "High"   as const },
      { jobRef: "REC-2026-008", title: "Corporate Law Associate",           dept: "Corporate Law",     status: "Open"           as const, applications: 9,  posted: "10 Sep 2026", closing: "10 Oct 2026", hiringManagerName: "Kwabena Asare",  priority: "High"   as const },
      { jobRef: "REC-2026-007", title: "Paralegal — Conveyancing",          dept: "Conveyancing",      status: "Open"           as const, applications: 7,  posted: "12 Sep 2026", closing: "12 Oct 2026", hiringManagerName: "Kojo Frimpong",  priority: "Medium" as const },
      { jobRef: "REC-2026-006", title: "HR Administrator",                  dept: "Human Resources",   status: "Offer Extended" as const, applications: 3,  posted: "20 Aug 2026", closing: "20 Sep 2026", hiringManagerName: "Yaa Bonsu",      priority: "High"   as const },
      { jobRef: "REC-2026-005", title: "Legal Secretary",                   dept: "Administration",    status: "Interviewing"   as const, applications: 11, posted: "15 Aug 2026", closing: "15 Sep 2026", hiringManagerName: "Nana Acheampong",priority: "Medium" as const },
      { jobRef: "REC-2026-004", title: "Associate — Family Law",            dept: "Family Law",        status: "Filled"         as const, applications: 18, posted: "01 Jul 2026", closing: "31 Jul 2026", hiringManagerName: "S.K. Boafo",     priority: "High"   as const },
      { jobRef: "REC-2026-003", title: "IT Support Specialist",             dept: "IT",                status: "Closed"         as const, applications: 22, posted: "15 Jun 2026", closing: "15 Jul 2026", hiringManagerName: "Nana Acheampong",priority: "Low"    as const },
    ];

    const jobIds: Record<string, any> = {};
    for (const j of jobDefs) {
      const id = await ctx.db.insert("jobPostings", {
        jobRef:           j.jobRef,
        title:            j.title,
        dept:             j.dept,
        status:           j.status,
        applications:     j.applications,
        postedDate:       j.posted,
        closingDate:      j.closing,
        hiringManagerName: j.hiringManagerName,
        priority:         j.priority,
      });
      jobIds[j.jobRef] = id;
    }

    // ── Job Applicants ─────────────────────────────────────────────────────────
    // cvUrl uses a publicly accessible sample PDF for demo purposes.
    // In production these would be Convex file storage URLs.
    const CV = "https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf";

    const applicantDefs = [
      // REC-2026-009 — Senior Associate, Litigation (Interviewing)
      { jobRef: "REC-2026-009", name: "Adwoa Osei",          email: "adwoa.osei@gmail.com",       appliedDate: "02 Sep 2026", status: "Interview"   as const, cvUrl: CV         },
      { jobRef: "REC-2026-009", name: "Kweku Frimpong",       email: "kweku.f@outlook.com",        appliedDate: "03 Sep 2026", status: "Interview"   as const, cvUrl: CV         },
      { jobRef: "REC-2026-009", name: "Abena Twum",           email: "abena.twum@yahoo.com",       appliedDate: "04 Sep 2026", status: "Shortlisted" as const, cvUrl: CV         },
      { jobRef: "REC-2026-009", name: "Samuel Boateng",       email: "sam.boateng@gmail.com",      appliedDate: "05 Sep 2026", status: "Shortlisted" as const, cvUrl: undefined  },
      { jobRef: "REC-2026-009", name: "Efua Owusu",           email: undefined,                    appliedDate: "06 Sep 2026", status: "Pending"     as const, cvUrl: CV         },
      { jobRef: "REC-2026-009", name: "Yaw Acheampong",       email: "yaw.a@company.gh",           appliedDate: "07 Sep 2026", status: "Rejected"    as const, cvUrl: undefined  },

      // REC-2026-008 — Corporate Law Associate (Open)
      { jobRef: "REC-2026-008", name: "Nana Boateng",         email: "n.boateng@yahoo.com",        appliedDate: "11 Sep 2026", status: "Pending"     as const, cvUrl: CV         },
      { jobRef: "REC-2026-008", name: "Kofi Darko",           email: "kofi.d@gmail.com",           appliedDate: "12 Sep 2026", status: "Shortlisted" as const, cvUrl: CV         },
      { jobRef: "REC-2026-008", name: "Akosua Asante",        email: "akosua.a@outlook.com",       appliedDate: "13 Sep 2026", status: "Pending"     as const, cvUrl: undefined  },
      { jobRef: "REC-2026-008", name: "Yaw Mensah",           email: undefined,                    appliedDate: "14 Sep 2026", status: "Pending"     as const, cvUrl: CV         },

      // REC-2026-007 — Paralegal, Conveyancing (Open)
      { jobRef: "REC-2026-007", name: "Yaa Sarpong",          email: "yaa.s@gmail.com",            appliedDate: "13 Sep 2026", status: "Pending"     as const, cvUrl: CV         },
      { jobRef: "REC-2026-007", name: "Kwame Osei",           email: "kwame.o@yahoo.com",          appliedDate: "14 Sep 2026", status: "Pending"     as const, cvUrl: undefined  },
      { jobRef: "REC-2026-007", name: "Adwoa Acheampong",     email: "adwoa.ach@gmail.com",        appliedDate: "15 Sep 2026", status: "Pending"     as const, cvUrl: CV         },

      // REC-2026-006 — HR Administrator (Offer Extended)
      { jobRef: "REC-2026-006", name: "Ama Mensah",           email: "a.mensah@company.gh",        appliedDate: "22 Aug 2026", status: "Offered"     as const, cvUrl: CV         },
      { jobRef: "REC-2026-006", name: "Kojo Asare",           email: "kojo.a@gmail.com",           appliedDate: "23 Aug 2026", status: "Rejected"    as const, cvUrl: CV         },
      { jobRef: "REC-2026-006", name: "Nana Twum",            email: "nana.twum@outlook.com",      appliedDate: "25 Aug 2026", status: "Rejected"    as const, cvUrl: undefined  },

      // REC-2026-005 — Legal Secretary (Interviewing)
      { jobRef: "REC-2026-005", name: "Efua Asante",          email: "efua.a@gmail.com",           appliedDate: "16 Aug 2026", status: "Interview"   as const, cvUrl: CV         },
      { jobRef: "REC-2026-005", name: "Abena Darko",          email: undefined,                    appliedDate: "17 Aug 2026", status: "Shortlisted" as const, cvUrl: CV         },
      { jobRef: "REC-2026-005", name: "Kweku Boateng",        email: "kweku.b@yahoo.com",          appliedDate: "18 Aug 2026", status: "Pending"     as const, cvUrl: undefined  },
      { jobRef: "REC-2026-005", name: "Ama Osei",             email: "ama.osei@gmail.com",         appliedDate: "19 Aug 2026", status: "Pending"     as const, cvUrl: CV         },

      // REC-2026-004 — Associate, Family Law (Filled)
      { jobRef: "REC-2026-004", name: "Akosua Frimpong",      email: "akosua.f@gmail.com",         appliedDate: "05 Jul 2026", status: "Offered"     as const, cvUrl: CV         },
      { jobRef: "REC-2026-004", name: "Kofi Agyeman",         email: "k.agyeman@outlook.com",      appliedDate: "06 Jul 2026", status: "Rejected"    as const, cvUrl: CV         },
      { jobRef: "REC-2026-004", name: "Yaa Boateng",          email: "yaa.b@yahoo.com",            appliedDate: "07 Jul 2026", status: "Rejected"    as const, cvUrl: undefined  },
      { jobRef: "REC-2026-004", name: "Nana Mensah",          email: undefined,                    appliedDate: "08 Jul 2026", status: "Rejected"    as const, cvUrl: CV         },
      { jobRef: "REC-2026-004", name: "Samuel Twum",          email: "s.twum@gmail.com",           appliedDate: "09 Jul 2026", status: "Rejected"    as const, cvUrl: undefined  },

      // REC-2026-003 — IT Support Specialist (Closed)
      { jobRef: "REC-2026-003", name: "Emmanuel Darko",       email: "e.darko@gmail.com",          appliedDate: "18 Jun 2026", status: "Rejected"    as const, cvUrl: CV         },
      { jobRef: "REC-2026-003", name: "Kwame Boateng",        email: "kwame.b@yahoo.com",          appliedDate: "20 Jun 2026", status: "Rejected"    as const, cvUrl: undefined  },
      { jobRef: "REC-2026-003", name: "Akua Mensah",          email: "akua.m@outlook.com",         appliedDate: "22 Jun 2026", status: "Rejected"    as const, cvUrl: CV         },
      { jobRef: "REC-2026-003", name: "Kofi Asare",           email: undefined,                    appliedDate: "25 Jun 2026", status: "Rejected"    as const, cvUrl: undefined  },
    ];

    for (const a of applicantDefs) {
      await ctx.db.insert("jobApplicants", {
        jobId:       jobIds[a.jobRef],
        name:        a.name,
        email:       a.email,
        appliedDate: a.appliedDate,
        status:      a.status,
        cvUrl:       a.cvUrl,
      });
    }

    // ── Onboardees ────────────────────────────────────────────────────────────
    const onboardeeDefs = [
      {
        name: "Akosua Mensah", role: "Associate — Litigation", dept: "Litigation",
        startDate: "22 Sep 2026", stage: "Pre-arrival" as const, progress: 20, buddy: "Kofi Owusu",
        checklist: [
          { task: "Offer letter signed",          done: true,  category: "Pre-arrival" },
          { task: "Right to work documents",       done: true,  category: "Pre-arrival" },
          { task: "IT setup request submitted",    done: false, category: "Pre-arrival" },
          { task: "Desk & access card arranged",   done: false, category: "Pre-arrival" },
          { task: "Orientation meeting scheduled", done: false, category: "Week 1" },
          { task: "Introduction to team",          done: false, category: "Week 1" },
          { task: "System access confirmed",       done: false, category: "Week 1" },
          { task: "HR induction completed",        done: false, category: "Week 1" },
          { task: "First matter assigned",         done: false, category: "Month 1" },
          { task: "30-day check-in",               done: false, category: "Month 1" },
        ],
      },
      {
        name: "Kweku Acheampong", role: "Paralegal", dept: "Conveyancing",
        startDate: "15 Sep 2026", stage: "Week 1" as const, progress: 55, buddy: "Ama Darko",
        checklist: [
          { task: "Offer letter signed",          done: true,  category: "Pre-arrival" },
          { task: "Right to work documents",       done: true,  category: "Pre-arrival" },
          { task: "IT setup request submitted",    done: true,  category: "Pre-arrival" },
          { task: "Desk & access card arranged",   done: true,  category: "Pre-arrival" },
          { task: "Orientation meeting scheduled", done: true,  category: "Week 1" },
          { task: "Introduction to team",          done: true,  category: "Week 1" },
          { task: "System access confirmed",       done: false, category: "Week 1" },
          { task: "HR induction completed",        done: false, category: "Week 1" },
          { task: "First matter assigned",         done: false, category: "Month 1" },
          { task: "30-day check-in",               done: false, category: "Month 1" },
        ],
      },
      {
        name: "Efua Agyeman", role: "HR Officer", dept: "Human Resources",
        startDate: "01 Sep 2026", stage: "Month 1" as const, progress: 80, buddy: "Yaa Bonsu",
        checklist: [
          { task: "Offer letter signed",          done: true,  category: "Pre-arrival" },
          { task: "Right to work documents",       done: true,  category: "Pre-arrival" },
          { task: "IT setup request submitted",    done: true,  category: "Pre-arrival" },
          { task: "Desk & access card arranged",   done: true,  category: "Pre-arrival" },
          { task: "Orientation meeting scheduled", done: true,  category: "Week 1" },
          { task: "Introduction to team",          done: true,  category: "Week 1" },
          { task: "System access confirmed",       done: true,  category: "Week 1" },
          { task: "HR induction completed",        done: true,  category: "Week 1" },
          { task: "First matter assigned",         done: false, category: "Month 1" },
          { task: "30-day check-in",               done: false, category: "Month 1" },
        ],
      },
      {
        name: "Nana Frimpong", role: "IT Support Specialist", dept: "IT",
        startDate: "18 Aug 2026", stage: "Completed" as const, progress: 100, buddy: "Nana Acheampong",
        checklist: [
          { task: "Offer letter signed",          done: true, category: "Pre-arrival" },
          { task: "Right to work documents",       done: true, category: "Pre-arrival" },
          { task: "IT setup request submitted",    done: true, category: "Pre-arrival" },
          { task: "Desk & access card arranged",   done: true, category: "Pre-arrival" },
          { task: "Orientation meeting scheduled", done: true, category: "Week 1" },
          { task: "Introduction to team",          done: true, category: "Week 1" },
          { task: "System access confirmed",       done: true, category: "Week 1" },
          { task: "HR induction completed",        done: true, category: "Week 1" },
          { task: "First matter assigned",         done: true, category: "Month 1" },
          { task: "30-day check-in",               done: true, category: "Month 1" },
        ],
      },
    ];

    for (const o of onboardeeDefs) {
      await ctx.db.insert("onboardees", {
        name:      o.name,
        role:      o.role,
        dept:      o.dept,
        startDate: o.startDate,
        stage:     o.stage,
        progress:  o.progress,
        buddy:     o.buddy,
        checklist: o.checklist,
      });
    }

    // ── Exit Clearances ───────────────────────────────────────────────────────
    const exitDefs = [
      {
        exitRef: "EXIT-2026-003", name: "James Osei",      role: "Associate",    dept: "Litigation",
        lastDay: "30 Sep 2026", reason: "Resignation", status: "In Progress" as const,
        clearanceItems: [
          { item: "Return of laptop & equipment", done: true,  owner: "IT" },
          { item: "Access badge & keys returned",  done: true,  owner: "Admin" },
          { item: "System accounts deactivated",   done: false, owner: "IT" },
          { item: "Final timesheet approved",      done: false, owner: "HR" },
          { item: "Handover notes submitted",      done: false, owner: "Manager" },
          { item: "Knowledge transfer completed",  done: false, owner: "Manager" },
          { item: "Final payslip processed",       done: false, owner: "Finance" },
          { item: "Exit interview completed",      done: false, owner: "HR" },
        ],
      },
      {
        exitRef: "EXIT-2026-002", name: "Ama Sarpong",     role: "Paralegal",    dept: "Conveyancing",
        lastDay: "15 Sep 2026", reason: "Contract End", status: "In Progress" as const,
        clearanceItems: [
          { item: "Return of laptop & equipment", done: true,  owner: "IT" },
          { item: "Access badge & keys returned",  done: true,  owner: "Admin" },
          { item: "System accounts deactivated",   done: true,  owner: "IT" },
          { item: "Final timesheet approved",      done: true,  owner: "HR" },
          { item: "Handover notes submitted",      done: true,  owner: "Manager" },
          { item: "Knowledge transfer completed",  done: false, owner: "Manager" },
          { item: "Final payslip processed",       done: false, owner: "Finance" },
          { item: "Exit interview completed",      done: false, owner: "HR" },
        ],
      },
      {
        exitRef: "EXIT-2026-001", name: "Kofi Boateng",    role: "Admin Officer", dept: "Administration",
        lastDay: "31 Aug 2026", reason: "Retirement", status: "Cleared" as const,
        clearanceItems: [
          { item: "Return of laptop & equipment", done: true, owner: "IT" },
          { item: "Access badge & keys returned",  done: true, owner: "Admin" },
          { item: "System accounts deactivated",   done: true, owner: "IT" },
          { item: "Final timesheet approved",      done: true, owner: "HR" },
          { item: "Handover notes submitted",      done: true, owner: "Manager" },
          { item: "Knowledge transfer completed",  done: true, owner: "Manager" },
          { item: "Final payslip processed",       done: true, owner: "Finance" },
          { item: "Exit interview completed",      done: true, owner: "HR" },
        ],
      },
    ];

    for (const e of exitDefs) {
      await ctx.db.insert("exitClearances", {
        exitRef:        e.exitRef,
        name:           e.name,
        role:           e.role,
        dept:           e.dept,
        lastDay:        e.lastDay,
        reason:         e.reason,
        status:         e.status,
        clearanceItems: e.clearanceItems,
      });
    }

    return {
      status: "Seed complete — now run: pnpm dlx convex run seed:seedPasswords to create login credentials",
      users: userDefs.length,
      jobs: jobDefs.length,
      onboardees: onboardeeDefs.length,
      exitClearances: exitDefs.length,
    };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// upsertAuthAccount — internal mutation called by seedPasswords.
// Writes a hashed password directly into authAccounts, bypassing HTTP.
// ─────────────────────────────────────────────────────────────────────────────
export const upsertAuthAccount = internalMutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { userId, email, secret }) => {
    const existing = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", "password").eq("providerAccountId", email)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { secret });
    } else {
      await ctx.db.insert("authAccounts", {
        userId,
        provider: "password",
        providerAccountId: email,
        secret,
      });
    }
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// seedPasswords — run AFTER seed:seed
// Directly hashes each password with PBKDF2 (same algorithm auth.ts uses for
// login verification) and writes the account row into authAccounts.
// No HTTP round-trip, no CONVEX_SITE_URL dependency.
//
// Run with: pnpm dlx convex run seed:seedPasswords
// ─────────────────────────────────────────────────────────────────────────────
export const seedPasswords = internalAction({
  args: {},
  handler: async (ctx) => {
    const credentials = [
      { email: "sk.boafo@skboafo.gh",     password: "SKBoafo@2026", label: "Managing Partner" },
      { email: "k.asare@skboafo.gh",      password: "Demo@2026!",   label: "Partner (Kwabena Asare)" },
      { email: "k.frimpong@skboafo.gh",   password: "Demo@2026!",   label: "Partner (Kojo Frimpong)" },
      { email: "k.mensah@skboafo.gh",     password: "Demo@2026!",   label: "Associate (Kofi Mensah)" },
      { email: "a.asante@skboafo.gh",     password: "Demo@2026!",   label: "Associate (Abena Asante)" },
      { email: "a.darko@skboafo.gh",      password: "Demo@2026!",   label: "Paralegal (Ama Darko)" },
      { email: "a.twum@skboafo.gh",       password: "Demo@2026!",   label: "Paralegal (Akua Twum)" },
      { email: "n.acheampong@skboafo.gh", password: "Demo@2026!",   label: "Admin (Nana Acheampong)" },
      { email: "y.bonsu@skboafo.gh",      password: "Demo@2026!",   label: "HR Officer (Yaa Bonsu)" },
    ];

    const results: { email: string; label: string; ok: boolean; error?: string }[] = [];

    for (const cred of credentials) {
      try {
        // Find the seeded user row
        const user = await ctx.runQuery(internal.users.getByEmail, { email: cred.email });
        if (!user) {
          results.push({ email: cred.email, label: cred.label, ok: false, error: "User not found — run seed:seed first" });
          console.warn(`[seedPasswords] ${cred.label} — user not found`);
          continue;
        }

        // Hash with PBKDF2 (same algorithm auth.ts uses for login verification)
        const secret = await hashPbkdf2(cred.password);

        // Write directly into authAccounts — no HTTP needed
        await ctx.runMutation(internal.seed.upsertAuthAccount, {
          userId: user._id,
          email: cred.email,
          secret,
        });

        results.push({ email: cred.email, label: cred.label, ok: true });
        console.log(`[seedPasswords] ${cred.label} — OK`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        results.push({ email: cred.email, label: cred.label, ok: false, error: msg });
        console.error(`[seedPasswords] ${cred.label} failed:`, msg);
      }
    }

    const failed = results.filter((r) => !r.ok);
    return {
      status: failed.length === 0 ? "All credentials seeded successfully" : `${failed.length} credential(s) failed`,
      results,
    };
  },
});
