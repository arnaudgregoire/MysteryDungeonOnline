const MdoObject = require('./MdoObject');
/**
 * Abstract class for visible MDO object. A visible object is an object that the player can see.
 */
class Visible extends MdoObject
{
    /**
     * 
     * @param {integer} x x position on map 
     * @param {integer} y y position on map
     * @param {MDO} type MDO type of object
     * @param {String} name Name of object
     * @param {String} description Description of object
     * @param {MDO_LOOK} look the key name associated to a pixel representation
     */
    constructor(x, y, type, name, description, look)
    {
        super(x, y, type, name, description);
        this.look = look;
        this.visible = true;
    }
}

module.exports = Visible;