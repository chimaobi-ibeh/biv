import { describe, it, expect } from 'vitest';
import { RECOMMENDATION_SCHEMA } from '@/app/api/analyze/route';
import { AIRecommendation } from '@/types';

/**
 * Structured outputs runs in strict mode: every object must set
 * additionalProperties: false and list every property in `required`, and
 * numeric/string constraints (minItems, maxLength, ...) are rejected outright.
 * A schema that breaks these rules fails at request time, which is expensive to
 * discover in production, so the invariants are pinned here instead.
 */

type JsonSchema = {
  type?: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  additionalProperties?: boolean;
  anyOf?: JsonSchema[];
};

/** Walk every object node in the schema, including through arrays and anyOf. */
function objectNodes(node: JsonSchema): JsonSchema[] {
  const found: JsonSchema[] = [];

  if (node.type === 'object') found.push(node);
  if (node.items) found.push(...objectNodes(node.items));
  if (node.anyOf) node.anyOf.forEach((n) => found.push(...objectNodes(n)));
  if (node.properties) {
    Object.values(node.properties).forEach((n) => found.push(...objectNodes(n)));
  }

  return found;
}

const schema = RECOMMENDATION_SCHEMA as unknown as JsonSchema;
const allObjects = objectNodes(schema);

describe('RECOMMENDATION_SCHEMA', () => {
  it('describes every object in the recommendation', () => {
    // Root, plus one for a roadmap week and one for a resource.
    expect(allObjects.length).toBe(3);
  });

  it('sets additionalProperties: false on every object', () => {
    for (const node of allObjects) {
      expect(node.additionalProperties).toBe(false);
    }
  });

  it('lists every property as required on every object', () => {
    for (const node of allObjects) {
      const properties = Object.keys(node.properties ?? {});
      expect([...(node.required ?? [])].sort()).toEqual([...properties].sort());
    }
  });

  it('uses no constraint keywords that strict mode rejects', () => {
    const banned = [
      'minItems',
      'maxItems',
      'minLength',
      'maxLength',
      'minimum',
      'maximum',
      'multipleOf',
      'pattern',
    ];
    const serialized = JSON.stringify(schema);

    for (const keyword of banned) {
      expect(serialized).not.toContain(`"${keyword}"`);
    }
  });

  it('makes an absent resource link expressible as null, not omitted', () => {
    const resource = allObjects.find((n) => n.properties?.link);

    expect(resource?.required).toContain('link');
    expect(resource?.properties?.link.anyOf).toEqual([
      { type: 'string' },
      { type: 'null' },
    ]);
  });

  it('covers exactly the fields the app reads off AIRecommendation', () => {
    // Compile-time proof the schema and the type agree on the top-level keys:
    // if AIRecommendation gains a field, this object stops type-checking.
    const fields: Record<keyof AIRecommendation, true> = {
      strengths: true,
      gaps: true,
      personalizedPlan: true,
      weeklyRoadmap: true,
      resources: true,
      riskAssessment: true,
    };

    expect(Object.keys(schema.properties ?? {}).sort()).toEqual(
      Object.keys(fields).sort()
    );
  });
});
