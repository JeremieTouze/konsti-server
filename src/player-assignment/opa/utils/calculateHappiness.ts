import { OpaAssignResults, Group } from 'typings/opaAssign.typings';

export const calculateHappiness = (
  assignment: OpaAssignResults,
  groups: Group[]
): number => {
  let happiness = 0;

  if (!assignment) return 0;

  assignment.forEach((m) => {
    const grpInd = groups.findIndex((g) => g.id === m.id);
    let ind = groups[grpInd].pref.findIndex((ele) => {
      return ele === m.assignment;
    });
    ind = ind + 1;
    if (ind > 0) {
      happiness = happiness + 1 / ind;
    }
  });

  return Math.round(((happiness / groups.length) * 10000) / 100);
};
