import { BlockDefinitionDictionary } from '../registry';
import { BaseZodDictionary } from '../utils';

/**
 * Identity function to type a BlockDefinitionDictionary
 * @param definitions One BlockDefinition per block type, keyed by type name
 * @returns typed BlockDefinitionDictionary
 */
export default function buildBlockDefinitionDictionary<T extends BaseZodDictionary>(
  definitions: BlockDefinitionDictionary<T>
) {
  return definitions;
}
