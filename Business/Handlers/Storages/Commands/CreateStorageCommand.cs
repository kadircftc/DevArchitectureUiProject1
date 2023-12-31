﻿
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
using Business.Handlers.Storages.ValidationRules;
using System;

namespace Business.Handlers.Storages.Commands
{
    /// <summary>
    /// 
    /// </summary>
    public class CreateStorageCommand : IRequest<IResult>
    {

        public System.DateTime CreatedDate { get; set; }
        public System.DateTime LastUpdatedDate { get; set; }
        public int CreatedUserId { get; set; }
        public int LastUpdatedUserId { get; set; }
        public bool Status { get; set; }
        public bool IsDeleted { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public bool IsRSale { get; set; }


        public class CreateStorageCommandHandler : IRequestHandler<CreateStorageCommand, IResult>
        {
            private readonly IStorageRepository _storageRepository;
            private readonly IMediator _mediator;
            public CreateStorageCommandHandler(IStorageRepository storageRepository, IMediator mediator)
            {
                _storageRepository = storageRepository;
                _mediator = mediator;
            }

            [ValidationAspect(typeof(CreateStorageValidator), Priority = 1)]
            [CacheRemoveAspect("Get")]
            [LogAspect(typeof(FileLogger))]
            [SecuredOperation(Priority = 1)]
            public async Task<IResult> Handle(CreateStorageCommand request, CancellationToken cancellationToken)
            {
                var isThereStorageRecord = await _storageRepository.GetAsync(u => u.ProductId == request.ProductId&&u.IsDeleted==false);

                if (isThereStorageRecord != null)
                    return new ErrorResult(Messages.NameAlreadyExist);

                var addedStorage = new Storage
                {
                    CreatedDate = DateTime.Now,
                    LastUpdatedDate = DateTime.Now,
                    CreatedUserId = 1,
                    LastUpdatedUserId = 1,
                    Status = true,
                    IsDeleted = false,
                    ProductId = request.ProductId,
                    Quantity = request.Quantity,
                    IsRSale = request.IsRSale,
                    
                };

                _storageRepository.Add(addedStorage);
                await _storageRepository.SaveChangesAsync();
                return new SuccessResult(Messages.Added);
            }
        }
    }
}