using Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Concrete
{
    public class Order:BaseEntity,IEntity
    {
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public int ProductQuantity { get; set; }
        public bool Confirmation { get; set; }
    }
}
