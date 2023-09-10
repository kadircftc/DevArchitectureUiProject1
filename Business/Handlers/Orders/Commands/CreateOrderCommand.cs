
using Business.BusinessAspects;
using Business.Constants;
using Core.Aspects.Autofac.Caching;
using Core.Aspects.Autofac.Logging;
using Core.Aspects.Autofac.Validation;
using Core.CrossCuttingConcerns.Logging.Serilog.Loggers;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using Business.Handlers.Orders.ValidationRules;
using System;
using Business.Services.UserService;

namespace Business.Handlers.Orders.Commands
{
    /// <summary>
    /// 
    /// </summary>
    public class CreateOrderCommand : IRequest<IResult>
    {

        public System.DateTime CreatedDate { get; set; }
        public System.DateTime LastUpdatedDate { get; set; }
        public int CreatedUserId { get; set; }
        public int LastUpdatedUserId { get; set; }
        public bool Status { get; set; }
        public bool IsDeleted { get; set; }
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public int ProductQuantity { get; set; }
        public bool Confirmation { get; set; }


        public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, IResult>
        {
            private readonly IOrderRepository _orderRepository;
            private readonly IMediator _mediator;
            private readonly IStorageRepository _storageRepository;
            private readonly IUserService _userService;
            public CreateOrderCommandHandler(IOrderRepository orderRepository, IMediator mediator,IStorageRepository storageRepository,IUserService userService)
            {
                _orderRepository = orderRepository;
                _mediator = mediator;
                _storageRepository = storageRepository;
                _userService = userService;
                
            }

            [ValidationAspect(typeof(CreateOrderValidator), Priority = 1)]
            [CacheRemoveAspect("Get")]
            [LogAspect(typeof(FileLogger))]
            [SecuredOperation(Priority = 1)]
            public async Task<IResult> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
            {
                var productIsReady=_storageRepository.Query().Any(u=>u.ProductId==request.ProductId&&u.IsRSale==true&&u.IsDeleted==false&&u.Quantity>=request.ProductQuantity);

                if (productIsReady !=true )
                {
                    return new ErrorResult(Messages.NameAlreadyExist);
                }

                var addedOrder = new Order
                {
                    CreatedDate = DateTime.Now,
                    LastUpdatedDate = DateTime.Now,
                    CreatedUserId = _userService.GetCurrentUserId(),
                    LastUpdatedUserId = _userService.GetCurrentUserId(),
                    Status = true,
                    IsDeleted = false,
                    UserId = _userService.GetCurrentUserId(),
                    ProductId = request.ProductId,
                    ProductQuantity = request.ProductQuantity,
                    Confirmation =false,
                };
                
                _orderRepository.Add(addedOrder);
                await _orderRepository.SaveChangesAsync();
                return new SuccessResult(Messages.Added);
            }
        }
    }
}