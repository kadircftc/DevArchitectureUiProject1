
using Business.Constants;
using Business.BusinessAspects;
using Core.Aspects.Autofac.Caching;
using Core.Aspects.Autofac.Logging;
using Core.CrossCuttingConcerns.Logging.Serilog.Loggers;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using Core.Aspects.Autofac.Validation;
using Business.Handlers.Orders.ValidationRules;
using System;
using Business.Services.UserService;

namespace Business.Handlers.Orders.Commands
{


    public class UpdateOrderCommand : IRequest<IResult>
    {
        public int Id { get; set; }
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

        public class UpdateOrderCommandHandler : IRequestHandler<UpdateOrderCommand, IResult>
        {
            private readonly IOrderRepository _orderRepository;
            private readonly IMediator _mediator;
            private readonly IStorageRepository _storageRepository;
            private readonly IUserService _userService;
            public UpdateOrderCommandHandler(IOrderRepository orderRepository, IMediator mediator,IStorageRepository storageRepository,IUserService userService)
            {
                _storageRepository = storageRepository;
                _orderRepository = orderRepository;
                _mediator = mediator;
                _userService = userService;
            }

            [ValidationAspect(typeof(UpdateOrderValidator), Priority = 1)]
            [CacheRemoveAspect("Get")]
            [LogAspect(typeof(FileLogger))]
            [SecuredOperation(Priority = 1)]
            public async Task<IResult> Handle(UpdateOrderCommand request, CancellationToken cancellationToken)
            {
                var isThereOrderRecord = await _orderRepository.GetAsync(u => u.Id == request.Id);
                var storageProductQuantity=await _storageRepository.GetAsync(u=>u.ProductId == request.ProductId);
                var isThereEnoughQuantity=  _storageRepository.Query().Any(u => u.ProductId== request.ProductId&&u.Quantity>=request.ProductQuantity&&u.IsDeleted==false);


                if (isThereEnoughQuantity==true)
                {
                    isThereOrderRecord.LastUpdatedDate = DateTime.Now;
                    isThereOrderRecord.LastUpdatedUserId = _userService.GetCurrentUserId();
                    isThereOrderRecord.Status = true;
                    isThereOrderRecord.IsDeleted = false;
                    isThereOrderRecord.UserId = request.UserId;
                    isThereOrderRecord.ProductId = request.ProductId;
                    isThereOrderRecord.ProductQuantity = request.ProductQuantity;
                    isThereOrderRecord.Confirmation = request.Confirmation;
                    _orderRepository.Update(isThereOrderRecord);

                    if (isThereOrderRecord.Confirmation == true) { 
                    storageProductQuantity.Quantity -= request.ProductQuantity;
                    _storageRepository.Update(storageProductQuantity);
                        await _storageRepository.SaveChangesAsync();
                    }
                    else
                    {
                        storageProductQuantity.Quantity += request.ProductQuantity;
                        _storageRepository.Update(storageProductQuantity);
                        await _storageRepository.SaveChangesAsync();
                    }
                    await _orderRepository.SaveChangesAsync();
                    return new SuccessResult(Messages.Updated);                   
                }
                else
                {
                    return new ErrorResult(Messages.InvalidCode);
                }
            }
        }
    }
}

