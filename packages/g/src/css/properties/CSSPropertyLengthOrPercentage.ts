import { singleton } from 'mana-syringe';
import type { DisplayObject, ParsedTextStyleProps } from '../../display-objects';
import { CSSUnitValue, UnitType } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import type { StyleValueRegistry } from '../interfaces';
import { PropertySyntax } from '../interfaces';
import { mergeDimensions, parseLengthOrPercentage } from '../parser/dimension';

function getFontSize(object: DisplayObject): CSSUnitValue {
  const { fontSize } = object.parsedStyle as ParsedTextStyleProps;
  if (fontSize && !CSSUnitValue.isRelativeUnit(fontSize.unit)) {
    return fontSize.clone();
  }
  return new CSSUnitValue(0, 'px');
}

/**
 * <length> & <percentage>
 */
@singleton({
  token: {
    token: CSSProperty,
    named: PropertySyntax.LENGTH_PERCENTAGE,
  },
})
export class CSSPropertyLengthOrPercentage
  implements Partial<CSSProperty<CSSUnitValue, CSSUnitValue>>
{
  parser = parseLengthOrPercentage;
  mixer = mergeDimensions;

  /**
   * according to parent's bounds
   *
   * @example
   * CSS.percent(50) -> CSS.px(0.5 * parent.width)
   */
  calculator(
    name: string,
    oldParsed: CSSUnitValue,
    computed: CSSUnitValue,
    object: DisplayObject,
    registry: StyleValueRegistry,
  ): CSSUnitValue {
    if (CSSUnitValue.isRelativeUnit(computed.unit)) {
      if (computed.unit === UnitType.kPercentage) {
        // try to resolve according to parent's geometry bounds
        // if (object.parentElement) {
        //   // registry.registerParentGeometryBoundsChangedHandler(object, name);
        //   return this.calculateUsedValueWithParentBounds(object, name);
        // } else {

        //   registry.addUnresolveProperty(object, name);

        //   // defer calculation after mounted
        //   // object.addEventListener(
        //   //   ElementEvent.MOUNTED,
        //   //   () => {
        //   //     registry.registerParentGeometryBoundsChangedHandler(object, name);
        //   //   },
        //   //   { once: true },
        //   // );
        // }
        return new CSSUnitValue(0, 'px');
      } else if (computed.unit === UnitType.kEms) {
        if (object.parentNode) {
          const fontSize = getFontSize(object.parentNode as DisplayObject);
          fontSize.value *= computed.value;
          return fontSize;
        }
        return new CSSUnitValue(0, 'px');
      } else if (computed.unit === UnitType.kRems) {
        if (object?.ownerDocument?.documentElement) {
          const fontSize = getFontSize(object.ownerDocument.documentElement as DisplayObject);
          fontSize.value *= computed.value;
          return fontSize;
        }
        return new CSSUnitValue(0, 'px');
      }
    } else {
      // remove listener if exists
      // registry.unregisterParentGeometryBoundsChangedHandler(object, name);

      // return absolute value
      return computed.clone();
    }
  }

  // private nameToBoundsIndex(name: string): number {
  //   if (name === 'x' || name === 'cx' || name === 'width') {
  //     return 0;
  //   } else if (name === 'y' || name === 'cy' || name === 'height') {
  //     return 1;
  //   }

  //   return 2;
  // }

  // private calculateUsedValueWithParentBounds(object: DisplayObject, name: string) {
  //   const bounds = (object.parentElement as DisplayObject).getGeometryBounds();
  //   const computedValue = object.computedStyle[name].value;
  //   return new CSSUnitValue(
  //     (bounds.halfExtents[this.nameToBoundsIndex(name)] * 2 * computedValue) / 100,
  //     'px',
  //   );
  // }
}