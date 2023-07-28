using Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Concrete
{
    public class Product : BaseEntity, IEntity
    {
        public string Name { get; set; }
        public string Color { get; set; } 
        public float Size { get; set; }
    }
}
