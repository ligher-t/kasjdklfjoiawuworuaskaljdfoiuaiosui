/* P13 classroom and campus event migration. A classroom narrative needs
 * an actual student, accessible campus and an operating offering, not the
 * country's educational reputation or an unrelated household flag. */
const EDUCATION_LEGACY_SCENE_REQUIREMENTS=Object.freeze({
  bias_peer_mockery:"peer",
  bias_teacher_lesson:"teacher",
  education_school_classroom:"formal",
  education_school_prejudice:"peer",
  education_school_family_pressure:"formal",
  cl_child_school_supplies:"formal",
  cl_ursus_school_divide:"peer",
  life_ursus_school_habit:"formal",
  daily_yan_53:"class",
  daily_yan_54:"advanced",
  daily_yan_56:"arts",
  daily_lungmen_58:"technical",
  daily_lungmen_59:"peer",
  daily_lungmen_60:"verified-cram-school",
  daily_higashi_51:"peer",
  daily_ursus_47:"class",
  daily_ursus_57:"equipment-sport",
  daily_ursus_58:"peer",
  daily_ursus_59:"commute",
  daily_ursus_60:"equipment-lab",
  daily_victoria_57:"class",
  daily_victoria_58:"equipment-engineering",
  daily_victoria_60:"club",
  daily_leithanien_57:"music",
  daily_leithanien_58:"music",
  daily_leithanien_60:"verified-exam",
  daily_leithanien_54:"verified-exam",
  daily_laterano_48:"religious",
  daily_laterano_49:"religious",
  daily_laterano_52:"equipment-shooting",
  daily_columbia_57:"equipment-electronics",
  daily_columbia_58:"club",
  daily_columbia_59:"club",
  daily_columbia_60:"tuition-notice",
  daily_kazimierz_57:"knight",
  daily_kazimierz_58:"peer",
  daily_kazimierz_59:"law-course",
  daily_kazimierz_60:"tuition-notice",
  daily_siracusa_50:"formal"
});
function educationLegacySceneGuard(s,id) {
  if(id==="life_ursus_classmate_contact"){
    return !!s.educationRecord?.enrollments?.some(e=>{
      const school=s.world?.educationWorld?.institutions?.[e.institutionId],
        area=s.world?.educationWorld?.areas?.[school?.homeAreaId];
      return e.startedYear<=s.year && area?.regionKey==="ウルサス";
    });
  }
  const kind=EDUCATION_LEGACY_SCENE_REQUIREMENTS[id];
  if(!kind)return true;
  const current=educationMigrationCurrent(s);
  if(!current||s.dead||s.mo<1||s.mo>12)return false;
  const {m,enroll,offering}=current,
    status=educationSchoolStatusAt(s,offering.id,s.year,s.mo);
  if(s.year<enroll.startedYear || !status ||
     status.teachingEquivalent<=0 || status.campusStatus==="destroyed" ||
     !educationCanReach(s,{
       institutionId:m.institutionId,campusId:m.campusId,
       offeringId:offering.id,year:s.year,month:s.mo,purpose:"daily-commute"
     }).reachable)return false;
  const people=s.world.educationWorld,
    sameOffering=(person)=>person.offeringId===offering.id;
  if(kind==="teacher"&&!Object.values(people.staff||{}).some(sameOffering))
    return false;
  if(kind==="peer"&&!Object.values(people.schoolPeers||{}).some(sameOffering))
    return false;
  if(kind==="advanced" && !["upper","preparatory","university"].includes(m.stage))
    return false;
  if(kind==="technical" && !["upper","vocational","university"].includes(m.stage))
    return false;
  if(kind==="arts" && m.stage!=="arts")return false;
  if(kind==="commute")return true;
  // Specific equipment/affiliations are never implied by a generic offering.
  const requirements={
    "verified-cram-school":"paid-external-tuition",
    "equipment-sport":"gym-equipment",
    "equipment-lab":"originium-chemistry-lab",
    "equipment-engineering":"steam-engineering-lab",
    "club":"registered-student-club",
    "music":"recorded-music-instruction",
    "verified-exam":"scheduled-examination",
    "religious":"religious-instruction",
    "equipment-shooting":"supervised-shooting-range",
    "equipment-electronics":"logic-lab",
    "knight":"knightly-training",
    "law-course":"commercial-knight-law",
    "tuition-notice":"individual-tuition-notice"
  };
  const tag=requirements[kind];
  if(tag){
    const verified=Object.values(s.educationSchoolExperiences?.items||{})
      .some(row=>row.enrollmentId===enroll.id &&
        row.offeringId===offering.id && row.experienceTag===tag &&
        row.evidenceRef && row.status==="verified" &&
        row.year===s.year);
    return verified;
  }
  return true;
}
